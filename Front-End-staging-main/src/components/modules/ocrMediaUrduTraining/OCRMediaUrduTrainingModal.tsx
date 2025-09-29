import { useState, useEffect } from "react";
import { backendServiceUrl } from "../../../api/apiConstants";
import { TrainedDataItem } from "../../../api/useGetOcrTrainedData.types";

type Props = {
  setIsModalOpen: () => void;
  selectedVersion: TrainedDataItem;
};

const imageSource = (path: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.replace(/^\/+/, "");
  return `${backendServiceUrl.replace(/\/+$/, "")}/${cleanPath}`;
};

export const OCRMediaUrduTrainingModal = ({
  setIsModalOpen,
  selectedVersion,
}: Props) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [framesState, setFramesState] = useState(selectedVersion.data);

  useEffect(() => {
    setFramesState(selectedVersion.data);
  }, [selectedVersion]);

  if (!framesState.length) {
    return null;
  }

  const handlePrevFile = () => {
    setCurrentFileIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextFile = () => {
    setCurrentFileIndex((prev) => Math.min(prev + 1, framesState.length - 1));
  };

  const currentFrame = framesState[currentFileIndex];

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

          {currentFrame.file_type === "image" ? (
            <img
              src={imageSource(currentFrame.file)}
              alt={`File ${currentFrame.id.toString()}`}
              className="max-h-64 rounded-lg border"
            />
          ) : (
            <video
              src={imageSource(currentFrame.file)}
              controls
              className="max-h-64 rounded-lg border"
            />
          )}

          <button
            onClick={handleNextFile}
            disabled={currentFileIndex === framesState.length - 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {currentFrame.frames.map((frame) => (
            <div
              key={frame.id}
              className="flex items-center gap-4 p-3 border rounded"
            >
              <img
                src={imageSource(frame.image_file)}
                alt={`Frame ${frame.id.toString()}`}
                className="w-40 h-40 object-contain rounded border"
              />
              <p className="whitespace-pre-wrap text-sm border p-2 rounded min-h-[80px]">
                {frame.extracted_text || "No text extracted"}
              </p>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-center gap-4">
          <button
            onClick={setIsModalOpen}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
