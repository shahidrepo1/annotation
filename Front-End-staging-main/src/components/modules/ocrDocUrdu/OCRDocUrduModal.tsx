import { useState, useRef } from "react";
import {
  FaEdit,
  FaCheck,
  FaTimes,
  FaDownload,
  FaFilePdf,
  FaRegFileWord,
} from "react-icons/fa";
import { AiFillFilePpt } from "react-icons/ai";
import UrduKeyboard from "../../ui/UrduKeyboard";
import useDocUrduUpdate from "../../../api/useOCRDocUrduUpdate";
import { toast } from "react-toastify";
import { backendServiceUrl } from "../../../api/apiConstants";
import { DocumentDataResponse } from "../../../api/useOCRUrduDocResponse.types";

type Props = {
  onClose: () => void;
  data: DocumentDataResponse | null;
  onSave: () => void;
};

export const OCRDocUrduModal = ({ onClose, data, onSave }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(data?.extracted_text || "");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { mutate } = useDocUrduUpdate();

  if (!data) return null;
  const { media_file } = data;

  const handleSave = () => {
    mutate(
      {
        media_file_id: media_file.id,
        extracted_text_id: data.id,
        extracted_text: editedText,
      },
      {
        onSuccess: () => {
          toast.success("Text updated successfully");
          setIsEditing(false);
        },
        onError: () => toast.error("Failed to update text"),
      }
    );
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-red-600 text-3xl" />;
    if (ext === "doc" || ext === "docx")
      return <FaRegFileWord className="text-blue-600 text-3xl" />;
    if (ext === "ppt" || ext === "pptx")
      return <AiFillFilePpt className="text-orange-600 text-3xl" />;
    return <span className="text-gray-600 font-bold">📄</span>;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white w-[900px] max-h-[90vh] rounded-xl shadow-lg border border-indigo-600 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Document Details</h2>
        </div>

        <div className="flex items-center gap-4 p-4 border-b bg-gray-50 rounded-md mx-4 mt-4 mb-2 shadow-sm">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-white border rounded-lg shadow">
            {getFileIcon(media_file.name)}
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-800">{media_file.name}</p>
            <p className="text-sm text-gray-500 capitalize">
              {media_file.file_type}
            </p>
          </div>

          <a
            href={`${backendServiceUrl.replace(/\/$/, "")}${media_file.file}`}
            download
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <FaDownload />
          </a>
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Extracted Text</h3>
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                }}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <FaEdit />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => {
                    setEditedText(data.extracted_text || "");
                    setIsEditing(false);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <>
              <textarea
                ref={inputRef}
                value={editedText}
                onChange={(e) => {
                  setEditedText(e.target.value);
                }}
                className="w-full border rounded p-2 min-h-[200px] text-gray-900"
              />
              <UrduKeyboard
                onSelect={(char) => {
                  if (!inputRef.current) return;
                  const cursorPos =
                    inputRef.current.selectionStart ?? editedText.length;

                  if (char === "backspace") {
                    const newText =
                      editedText.slice(0, cursorPos - 1) +
                      editedText.slice(cursorPos);
                    setEditedText(newText);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.selectionStart = cursorPos - 1;
                        inputRef.current.selectionEnd = cursorPos - 1;
                      }
                    }, 0);
                  } else {
                    const newText =
                      editedText.slice(0, cursorPos) +
                      char +
                      editedText.slice(cursorPos);
                    setEditedText(newText);
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.selectionStart = cursorPos + 1;
                        inputRef.current.selectionEnd = cursorPos + 1;
                      }
                    }, 0);
                  }
                }}
              />
            </>
          ) : (
            <p className="whitespace-pre-wrap border rounded p-2 min-h-[200px]">
              {editedText || "No text extracted"}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-center gap-4">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
