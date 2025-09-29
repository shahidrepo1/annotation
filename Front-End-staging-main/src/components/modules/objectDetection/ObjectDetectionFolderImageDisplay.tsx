import { useState } from "react";
import { backendServiceUrl } from "../../../api/apiConstants";
import { ObjectImageAnnotate } from "./ObjectImageAnnotate";
import { Rectangle } from "../logo detection/LogoImageAnnotateComponent/LogoCanvasControls";
import useOdProcessedImage from "../../../api/useOdProcessedImage";
import { toast } from "react-toastify";
import { OdLabeledImageGroup } from "../../../api/useGetOdProcessedImages.types";
import { PiFolderOpenFill } from "react-icons/pi";
import { queryClient } from "../../../main";
import axios from "axios";

type ObjectFolderImageDisplayProps = {
  odData: OdLabeledImageGroup | null;
  onCloseModal: () => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
  isTrained: boolean;
};
export const ObjectDetectionFolderImageDisplay = ({
  odData,
  onCloseModal,
  selectedIds,
  setSelectedIds,
  isTrained,
}: ObjectFolderImageDisplayProps) => {
  const [annotations, setAnnotations] = useState<
    Record<string, Array<Rectangle>>
  >({});
  const [selectedImageData, setSelectedImageData] = useState<
    OdLabeledImageGroup["images"][0] | null
  >(null);

  const { mutate } = useOdProcessedImage();

  if (!odData) return null;

  const handleImageClick = (image: (typeof odData.images)[0]) => {
    setSelectedImageData(image);
  };

  const handleCloseAnnotation = () => {
    setSelectedImageData(null);
  };

  const toggleCheckbox = (image: (typeof odData.images)[number]) => {
    const detectionIds = image.detections.map((d) => d.detection_id);
    setSelectedIds((prev) => {
      const allSelected = detectionIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !detectionIds.includes(id));
      } else {
        return [...new Set([...prev, ...detectionIds])];
      }
    });
  };

  const handleSaveAndContinue = () => {
    const payload = Object.entries(annotations)
      .filter(([, rectangles]) => rectangles.length > 0)
      .map(([imageId, rectangles]) => ({
        processed_image_id: parseInt(imageId),
        detections: rectangles.map((rect) => ({
          detection_id: rect.id ? parseInt(rect.id) : undefined,
          label: rect.className ?? "Unlabeled",
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        })),
      }));

    if (payload.length === 0) {
      toast.warning("No annotations to save.");
      return;
    }
    mutate(payload, {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ["ProccessedImages"],
        });
        void queryClient.invalidateQueries({ queryKey: ["OdLabels"] });
        toast.success("Annotations saved successfully.");

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
        <ObjectImageAnnotate
          imageSrc={`${backendServiceUrl.replace(
            /\/$/,
            ""
          )}/media/od_media/images/${selectedImageData.processedImage.replace(
            /^\//,
            ""
          )}`}
          initialRectangles={
            Array.isArray(annotations[selectedImageData.image_id]) &&
            annotations[selectedImageData.image_id].length > 0
              ? annotations[selectedImageData.image_id]
              : selectedImageData.detections.map((det) => ({
                  id: det.detection_id.toString(),
                  detection_id: det.detection_id,
                  x: det.x,
                  y: det.y,
                  width: det.width,
                  height: det.height,
                  className: odData.label,
                }))
          }
          onClose={handleCloseAnnotation}
          onSaveAnnotation={({ rectangles }) => {
            setAnnotations((prev) => {
              const imageId = selectedImageData.image_id.toString();
              return {
                ...prev,
                [imageId]: rectangles,
              };
            });
          }}
          isTrained={isTrained}
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="inline-flex items-center gap-3 text-md font-semibold text-indigo-500 p-2">
            <PiFolderOpenFill className="text-2xl sm:text-3xl md:text-4xl" />
            <span>{odData.label}</span>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 bg-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {odData.images.map((image) => {
                const imageUrl = `${backendServiceUrl.replace(
                  /\/$/,
                  ""
                )}/media/od_media/images/${image.processedImage.replace(
                  /^\//,
                  ""
                )}`;
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
                        checked={image.detections.every((det) =>
                          selectedIds.includes(det.detection_id)
                        )}
                        onChange={() => {
                          toggleCheckbox(image);
                        }}
                      />
                    </div>
                    <img
                      src={imageUrl}
                      alt="processed image"
                      className="w-full h-full object-contain p-2"
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
