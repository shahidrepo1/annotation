import { OCRMediaResponse } from "../../../api/useOCRMediaUrduResponse.types";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { backendServiceUrl } from "../../../api/apiConstants";
import { useState, useRef } from "react";
import UrduKeyboard from "../../ui/UrduKeyboard";
import useMediaUrduUpdate from "../../../api/useOCRMediaUrduUpdate";
import useDeleteOCRMediaChunks from "../../../api/useDeleteOcrMedia";
import { toast } from "react-toastify";
import { queryClient } from "../../../main";

type Props = {
  onSave: () => void;
  onClose: () => void;
  data: OCRMediaResponse | null;
};

const imageSource = (path: string) => {
  if (!path) return "";
  const cleanPath = path.replace(/^\/+/, "");
  const decoded = decodeURI(cleanPath);
  return `${backendServiceUrl.replace(/\/+$/, "")}/${encodeURI(decoded)}`;
};

export const OCRUrduMediaModal = ({ onSave, onClose, data }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<Record<number, string>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [framesState, setFramesState] = useState(
    data?.media_file?.frames || []
  );

  const { mutate } = useMediaUrduUpdate();
  const { mutate: deleteFrame } = useDeleteOCRMediaChunks();

  if (!data) return null;
  const { media_file } = data;

  const handleEditClick = (frameId: number, text: string) => {
    setEditingId(frameId);
    setEditedText((prev) => ({ ...prev, [frameId]: text }));
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleTextChange = (frameId: number, value: string) => {
    setEditedText((prev) => ({ ...prev, [frameId]: value }));
  };

  const handleSaveChunk = (frameId: number) => {
    mutate(
      {
        media_file_id: media_file.id,
        frames: [{ frame_id: frameId, extracted_text: editedText[frameId] }],
      },
      {
        onSuccess: () => {
          toast.success("Text updated successfully");
          setFramesState((prev) =>
            prev.map((f) =>
              f.id === frameId
                ? { ...f, extracted_text: editedText[frameId] }
                : f
            )
          );
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to update text");
        },
      }
    );
  };

  const handleDelete = (frameIds: Array<number>) => {
    deleteFrame(frameIds, {
      onSuccess: () => {
        setFramesState((prev) => prev.filter((f) => !frameIds.includes(f.id)));
        toast.success("Frames deleted successfully");
        void queryClient.invalidateQueries({
          queryKey: ["OcrMedia"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["ocrFolders"],
        });
      },
      onError: () => toast.error("Failed to delete frames"),
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white w-[900px] max-h-[90vh] rounded-xl shadow-lg border border-indigo-600 flex flex-col">
        <div className="flex justify-center p-4 border-b">
          {media_file?.file_type === "image" ? (
            <img
              src={imageSource(media_file?.file)}
              alt={media_file?.name}
              className="max-h-64 rounded-lg border"
            />
          ) : media_file?.file_type === "video" ? (
            <video controls className="max-h-64 rounded-lg border">
              <source src={imageSource(media_file?.file)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="text-gray-500">Unsupported file type</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {framesState.map((frame) => (
            <div
              key={frame.id}
              className="flex items-start gap-4 p-3 border rounded"
            >
              <img
                src={imageSource(frame.image_file)}
                alt={`Frame ${frame.id.toString()}`}
                className="w-32 h-32 object-contain rounded border"
              />

              <div className="flex-1 flex flex-col gap-2">
                {editingId === frame.id ? (
                  <>
                    <input
                      type="text"
                      ref={(el) => (inputRefs.current[frame.id] = el)}
                      value={editedText[frame.id] || ""}
                      onChange={(e) => {
                        handleTextChange(frame.id, e.target.value);
                      }}
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                    <UrduKeyboard
                      onSelect={(char) => {
                        const inputEl = inputRefs.current[frame.id];
                        if (!inputEl) return;

                        const currentValue = editedText[frame.id] || "";
                        const cursorPos =
                          inputEl.selectionStart ?? currentValue.length;

                        if (char === "backspace") {
                          const newText =
                            currentValue.slice(0, cursorPos - 1) +
                            currentValue.slice(cursorPos);
                          handleTextChange(frame.id, newText);
                          setTimeout(() => {
                            inputEl.selectionStart = inputEl.selectionEnd =
                              cursorPos - 1;
                          }, 0);
                        } else {
                          const newText =
                            currentValue.slice(0, cursorPos) +
                            char +
                            currentValue.slice(cursorPos);
                          handleTextChange(frame.id, newText);
                          setTimeout(() => {
                            inputEl.selectionStart = inputEl.selectionEnd =
                              cursorPos + char.length;
                          }, 0);
                        }
                      }}
                    />
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-sm border p-2 rounded min-h-[80px]">
                    {frame.extracted_text || "No text extracted"}
                  </p>
                )}
              </div>

              <div className="flex flex-row gap-2 text-gray-600">
                {editingId === frame.id ? (
                  <>
                    <button
                      onClick={() => {
                        handleSaveChunk(frame.id);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleEditClick(frame.id, frame.extracted_text || "");
                      }}
                      className="hover:text-indigo-500"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        handleDelete([frame.id]);
                      }}
                      className="hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
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
