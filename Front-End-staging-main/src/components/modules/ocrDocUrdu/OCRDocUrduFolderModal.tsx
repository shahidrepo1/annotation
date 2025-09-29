import { useState, useRef, useEffect } from "react";
import {
  FaEdit,
  FaCheck,
  FaTimes,
  FaDownload,
  FaFilePdf,
  FaRegFileWord,
} from "react-icons/fa";
import { AiFillFilePpt } from "react-icons/ai";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import useGetAllOCRDoc from "../../../api/useGetAllOcrDoc";
import useDocUrduUpdate from "../../../api/useOCRDocUrduUpdate";
import { backendServiceUrl } from "../../../api/apiConstants";
import { toast } from "react-toastify";
import UrduKeyboard from "../../ui/UrduKeyboard";

type Props = {
  onClose: () => void;
};

export const OCRDocUrduFolderModal = ({ onClose }: Props) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetAllOCRDoc();
  const { mutate } = useDocUrduUpdate();
  const [ref, entry] = useIntersectionObserver({
    threshold: 1,
    root: null,
    rootMargin: "0px",
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch((error: unknown) => {
        console.error("Error fetching next page: ", error);
      });
    }
  }, [entry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [expandedIds, setExpandedIds] = useState<Array<number>>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-red-600 text-2xl" />;
    if (ext === "doc" || ext === "docx")
      return <FaRegFileWord className="text-blue-600 text-2xl" />;
    if (ext === "ppt" || ext === "pptx")
      return <AiFillFilePpt className="text-orange-600 text-2xl" />;
    return <span className="text-gray-600 font-bold">📄</span>;
  };

  const handleSave = (docId: number, mediaFileId: number) => {
    mutate(
      {
        media_file_id: mediaFileId,
        extracted_text_id: docId,
        extracted_text: editedText,
      },
      {
        onSuccess: () => {
          toast.success("Text updated successfully");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update text"),
      }
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-[1000px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
        <h2 className="text-lg font-semibold mb-4">OCR Documents</h2>

        {data?.pages.map((page) =>
          page.results.map((doc) => (
            <div key={doc.id} className="border-b py-4">
              <div className="flex items-start gap-4 mb-3">
                <input type="checkbox" className="mt-2" />

                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 flex items-center justify-center border rounded bg-gray-50">
                    {getFileIcon(doc.media_file.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm break-all max-w-[300px]">
                      {doc.media_file.name}
                    </span>
                    <a
                      href={`${backendServiceUrl.replace(/\/$/, "")}${
                        doc.media_file.file
                      }`}
                      download
                      className="text-sm flex items-center gap-1 text-indigo-600 hover:underline mt-1"
                    >
                      <FaDownload /> Download
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingId === doc.id ? (
                    <>
                      <button
                        onClick={() => {
                          handleSave(doc.id, doc.media_file.id);
                        }}
                        className="text-green-600 p-1 hover:bg-green-100 rounded"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                        }}
                        className="text-red-600 p-1 hover:bg-red-100 rounded"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(doc.id);
                        setEditedText(doc.extracted_text || "");
                      }}
                      className="text-indigo-600 p-1 hover:bg-indigo-100 rounded"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
              </div>

              <div className="ml-9">
                <span className="text-sm text-gray-600 font-medium block mb-1">
                  Extracted Text
                </span>

                {editingId === doc.id ? (
                  <>
                    <textarea
                      ref={inputRef}
                      value={editedText}
                      onChange={(e) => {
                        setEditedText(e.target.value);
                      }}
                      className="w-full border rounded p-2 min-h-[150px] text-sm"
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
                        } else {
                          const newText =
                            editedText.slice(0, cursorPos) +
                            char +
                            editedText.slice(cursorPos);
                          setEditedText(newText);
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="border rounded p-3 text-sm whitespace-pre-wrap relative bg-gray-50">
                    {expandedIds.includes(doc.id)
                      ? doc.extracted_text
                      : doc.extracted_text?.slice(0, 200) ||
                        "No text extracted"}
                    {doc.extracted_text && doc.extracted_text.length > 200 && (
                      <button
                        onClick={() => {
                          toggleExpand(doc.id);
                        }}
                        className="text-indigo-600 text-sm ml-2 mt-2 inline-block"
                      >
                        {expandedIds.includes(doc.id)
                          ? "Show less"
                          : "...load more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={ref} className="py-4 text-center text-gray-500">
          {hasNextPage && isFetchingNextPage && "Loading more..."}
          {!hasNextPage && "No more data"}
        </div>

        <div className="sticky bottom-0 bg-white border-t mt-4 pt-3 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
