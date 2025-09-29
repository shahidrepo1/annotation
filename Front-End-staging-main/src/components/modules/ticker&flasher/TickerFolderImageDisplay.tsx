import { useState } from "react";
import { backendServiceUrl } from "../../../api/apiConstants";
import { TickerImageAnnotate } from "./TickerImageAnnotate";
import { Rectangle } from "../logo detection/LogoImageAnnotateComponent/LogoCanvasControls";
import useTfProcessedImage from "../../../api/useTfProcessingImage";
import { toast } from "react-toastify";
import { TickerDataGroupType } from "../../../api/useGetTfProcessedImages.types";
import { PiFolderOpenFill } from "react-icons/pi";
import { queryClient } from "../../../main";
import axios from "axios";

type TickerFolderImageDisplayProps = {
  tfData: TickerDataGroupType | null;
  onCloseModal: () => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
  isTrained: boolean;
};

export const TickerFolderImageDisplay = ({
  tfData,
  onCloseModal,
  selectedIds,
  setSelectedIds,
  isTrained,
}: TickerFolderImageDisplayProps) => {
  const [annotations, setAnnotations] = useState<
    Record<string, Array<Rectangle>>
  >({});
  const [selectedImageData, setSelectedImageData] = useState<
    TickerDataGroupType["images"][0] | null
  >(null);

  const { mutate } = useTfProcessedImage();

  if (!tfData) return null;

  const handleImageClick = (image: (typeof tfData.images)[0]) => {
    setSelectedImageData(image);
  };

  const handleCloseAnnotation = () => {
    setSelectedImageData(null);
  };

  const toggleCheckbox = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveAndContinue = () => {
    const payload = Object.entries(annotations).map(
      ([imageId, rectangles]) => ({
        processed_image_id: parseInt(imageId),
        detections: rectangles.map((rect) => {
          if (rect.id && rect.delete) {
            return {
              id: Number(rect.id),
              delete: true,
            };
          } else if (rect.id) {
            return {
              id: Number(rect.id),
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              label: rect.className ?? "Unlabeled",
            };
          } else {
            return {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              label: rect.className ?? "Unlabeled",
            };
          }
        }),
      })
    );

    const hasDetections = payload.some((item) => item.detections.length > 0);

    if (!hasDetections) {
      toast.warning("No annotations to save.");
      return;
    }

    mutate(payload, {
      onSuccess: () => {
        toast.success("Annotations saved successfully.");
        void queryClient.invalidateQueries({
          queryKey: ["TfProccessedImages"],
        });
        setAnnotations({});
        setSelectedImageData(null);
        setSelectedIds([]);
        onCloseModal();
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const err = error.response?.data as { message?: string };
          toast.error(err?.message || "Failed to save annotations");
        } else {
          toast.error("Something went wrong.");
        }
      },
    });
  };

  return (
    <>
      {selectedImageData ? (
        <TickerImageAnnotate
          imageSrc={`${backendServiceUrl}media/tf_media/images/${selectedImageData.processedImage}`}
          initialRectangles={
            Array.isArray(annotations[selectedImageData.image_id]) &&
            annotations[selectedImageData.image_id].length > 0
              ? annotations[selectedImageData.image_id]
              : selectedImageData.detections.map((det) => ({
                  id: det.detection_id.toString(),
                  x: det.x,
                  y: det.y,
                  width: det.width,
                  height: det.height,
                  className: tfData.label,
                }))
          }
          onClose={handleCloseAnnotation}
          onSaveAnnotation={({ rectangles }) => {
            setAnnotations((prev) => {
              const imageId = selectedImageData.image_id.toString();
              const updated = {
                ...prev,
                [imageId]: rectangles,
              };

              return updated;
            });
          }}
          isTrained={isTrained}
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="inline-flex items-center gap-3 text-md font-semibold text-indigo-500 p-2">
            <PiFolderOpenFill className="text-2xl sm:text-3xl md:text-4xl" />
            <span>{tfData.label}</span>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 bg-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {tfData.images.map((image) => {
                const imageUrl = `${backendServiceUrl}media/tf_media/images/${image.processedImage}`;
                return (
                  <div
                    key={image.image_id}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      handleImageClick(image);
                    }}
                  >
                    <div
                      className="absolute top-2 left-2 z-0 p-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(image.image_id)}
                        onChange={() => {
                          toggleCheckbox(image.image_id);
                        }}
                      />
                    </div>
                    <img
                      src={imageUrl}
                      alt="processed image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white py-4 border-t border-gray-200">
            <div className="flex justify-center">
              <button
                className="bg-indigo-600 text-white py-2 px-4 rounded"
                onClick={handleSaveAndContinue}
                disabled={tfData.images.length === 0}
              >
                Save and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
