import { OCRMediaData, Frame } from "../../../api/useGetAllOCRMedia.types";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { backendServiceUrl } from "../../../api/apiConstants";
import { useState, useRef, useEffect } from "react";
import UrduKeyboard from "../../ui/UrduKeyboard";
import useMediaUrduUpdate from "../../../api/useOCRMediaUrduUpdate";
import useDeleteOCRMediaChunks from "../../../api/useDeleteOcrMedia";
import { toast } from "react-toastify";
import { queryClient } from "../../../main";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import CircularLoader from "../../primitives/CircularLoader";

type Props = {
  onSave: () => void;
  onClose: () => void;
  data: OCRMediaData | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  selectedFrames: Set<number>;
  onFrameSelect: (frameId: number, isSelected: boolean) => void;
  onAllFramesSelect: (frameIds: Array<number>, isSelected: boolean) => void;
  isTrained?: boolean;
};

const imageSource = (path: string) => {
  if (!path) return "";
  const cleanPath = path.replace(/^\/+/, "");
  const decoded = decodeURI(cleanPath);
  return `${backendServiceUrl.replace(/\/+$/, "")}/${encodeURI(decoded)}`;
};

export const OCRUrduMediaFolderModal = ({
  onSave,
  onClose,
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  selectedFrames,
  onFrameSelect,
  // onAllFramesSelect,
  isTrained,
}: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<Record<number, string>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const currentFile = data?.results[currentFileIndex] || null;
  const [framesState, setFramesState] = useState<Array<Frame>>(
    currentFile?.frames.results || []
  );
  useEffect(() => {
    if (currentFile) {
      setFramesState((prev) => {
        const updated = currentFile.frames.results.map((f) => {
          const existing = prev.find((p) => p.id === f.id);
          return existing ? { ...f, ...existing } : f;
        });
        return updated;
      });
    }
  }, [currentFileIndex, data]);

  const [ref, entry] = useIntersectionObserver({
    threshold: 0.5,
    root: document.querySelector(".modal-scroll-container"),
  });

  useEffect(() => {
    if (
      entry?.isIntersecting &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isPending
    ) {
      fetchNextPage();
    }
  }, [entry, hasNextPage, isFetchingNextPage, isPending, fetchNextPage]);

  const { mutate } = useMediaUrduUpdate();
  const { mutate: deleteFrame } = useDeleteOCRMediaChunks();

  if (!data) return null;

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

  const handleSaveChunk = (frameId: number, mediaFileId: number) => {
    mutate(
      {
        media_file_id: mediaFileId,
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
        onError: () => toast.error("Failed to update text"),
      }
    );
  };

  const handleDelete = (frameIds: Array<number>) => {
    deleteFrame(frameIds, {
      onSuccess: () => {
        setFramesState((prev) => prev.filter((f) => !frameIds.includes(f.id)));
        toast.success("Frames deleted successfully");
        void queryClient.invalidateQueries({ queryKey: ["OcrMedia"] });
        void queryClient.invalidateQueries({ queryKey: ["ocrFolders"] });
      },
      onError: () => toast.error("Failed to delete frames"),
    });
  };

  const handlePrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex((prev) => prev - 1);
    }
  };

  const handleNextFile = () => {
    if (currentFileIndex < (data.results.length || 1) - 1) {
      setCurrentFileIndex((prev) => prev + 1);
    }
  };

  const renderFrameCheckbox = (frameId: number) => (
    <input
      type="checkbox"
      className="w-3 h-3"
      checked={selectedFrames.has(frameId)}
      onChange={(e) => {
        onFrameSelect(frameId, e.target.checked);
      }}
    />
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white w-[900px] max-h-[90vh] rounded-xl shadow-lg border border-indigo-600 flex flex-col">
        <div className="flex justify-center items-center gap-4 p-4 border-b">
          <button
            onClick={handlePrevFile}
            disabled={currentFileIndex === 0}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {currentFile?.file_type === "image" ? (
            <img
              src={currentFile.file || ""}
              alt={currentFile.name}
              className="max-h-64 rounded-lg border"
            />
          ) : currentFile?.file_type === "video" ? (
            <video controls className="max-h-64 rounded-lg border">
              <source src={currentFile.file || ""} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="text-gray-500">Unsupported file type</p>
          )}

          <button
            onClick={handleNextFile}
            disabled={currentFileIndex === (data.results.length || 1) - 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {framesState.map((frame) => (
            <div
              key={frame.id}
              className="p-3 border rounded flex flex-col gap-3"
            >
              {/* Top row: checkbox + download */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderFrameCheckbox(frame.id)}
                  <span className="text-sm font-medium text-gray-700">
                    Document
                  </span>
                </div>
                <a
                  href={imageSource(frame.image_file)}
                  download
                  className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200"
                >
                  Download
                </a>
              </div>

              {/* Extracted text / editing (always below) */}
              <div className="flex flex-col gap-2 ml-6">
                {editingId === frame.id ? (
                  <>
                    <input
                      type="text"
                      ref={(el) => (inputRefs.current[frame.id] = el)}
                      value={editedText[frame.id] || ""}
                      onChange={(e) =>
                        handleTextChange(frame.id, e.target.value)
                      }
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

              {/* Actions: edit / save / delete */}
              <div className="flex justify-end gap-2 text-gray-600">
                {editingId === frame.id ? (
                  <>
                    <button
                      onClick={() =>
                        handleSaveChunk(frame.id, frame.media_file)
                      }
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
                        if (!isTrained)
                          handleEditClick(frame.id, frame.extracted_text || "");
                      }}
                      className={`hover:text-indigo-500 ${
                        isTrained ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isTrained}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        if (!isTrained) handleDelete([frame.id]);
                      }}
                      className={`hover:text-red-500 ${
                        isTrained ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isTrained}
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          <div ref={ref} className="h-12 flex justify-center items-center">
            {isFetchingNextPage && <CircularLoader />}
          </div>
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
