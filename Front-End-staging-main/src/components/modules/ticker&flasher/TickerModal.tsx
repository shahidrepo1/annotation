import { useState } from "react";
import { TickerResponse, TickerItem } from "../../../api/useTickerUpload.types";
import { backendServiceUrl } from "../../../api/apiConstants";
import { TickerImageAnnotate } from "./TickerImageAnnotate";
import { Rectangle } from "../logo detection/LogoImageAnnotateComponent/LogoCanvasControls";
import useTfProcessedImage from "../../../api/useTfProcessingImage";
import { toast } from "react-toastify";
import axios from "axios";
import { queryClient } from "../../../main";

type TickerModalProps = {
  tfData: TickerResponse | null;
  onCloseModal: () => void;
};

export const TickerModal = ({ tfData, onCloseModal }: TickerModalProps) => {
  const [activeTab, setActiveTab] = useState("Not Annotated");
  const [annotations, setAnnotations] = useState<
    Record<string, Array<Rectangle>>
  >({});
  const [selectedImageData, setSelectedImageData] = useState<TickerItem | null>(
    null
  );
  const { mutate } = useTfProcessedImage();

  if (!tfData) return null;

  const flattenedData = tfData.data.flat();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleImageClick = (image: TickerItem) => {
    setSelectedImageData(image);
  };

  const handleCloseAnnotation = () => {
    setSelectedImageData(null);
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

  const imagesToDisplay = flattenedData.filter((image) => {
    const annotated = annotations[image.id];
    const isAnnotated = Array.isArray(annotated) && annotated.length > 0;
    return activeTab === "Annotated" ? isAnnotated : !isAnnotated;
  });

  return (
    <>
      {selectedImageData ? (
        <TickerImageAnnotate
          imageSrc={`${backendServiceUrl}media/tf_media/images/${selectedImageData.processed_image}`}
          initialRectangles={
            Array.isArray(annotations[selectedImageData.id]) &&
            annotations[selectedImageData.id].length > 0
              ? annotations[selectedImageData.id]
              : selectedImageData.detections.map((det) => ({
                  id: det.id.toString(),
                  x: det.x,
                  y: det.y,
                  width: det.width,
                  height: det.height,
                  className: det.label?.label_name || "Unlabeled",
                }))
          }
          onClose={handleCloseAnnotation}
          onSaveAnnotation={({ rectangles }) => {
            const imageId = selectedImageData.id.toString();
            const originalRects = selectedImageData.detections.map((det) => ({
              label: det.label?.label_name || "Unlabeled",
              x: det.x,
              y: det.y,
              width: det.width,
              height: det.height,
            }));

            const newRects = rectangles.map((r) => ({
              label: r.className ?? "Unlabeled",
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
            }));

            const isChanged =
              newRects.length !== originalRects.length ||
              newRects.some((r, i) => {
                const o = originalRects[i];
                return (
                  r.label !== o.label ||
                  r.x !== o.x ||
                  r.y !== o.y ||
                  r.width !== o.width ||
                  r.height !== o.height
                );
              });

            if (isChanged) {
              setAnnotations((prev) => ({
                ...prev,
                [imageId]: rectangles,
              }));
              setActiveTab("Annotated");
            } else {
              toast.info("No changes were made to the annotation.");
            }
          }}
          isTrained={false}
        />
      ) : (
        <>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col">
              Batch Name:
              <div className="border border-gray-400 p-2 rounded-md focus:outline-none">
                {flattenedData[0]?.created_at}
              </div>
            </div>
            <div className="flex flex-col">
              Tags:
              <input
                type="text"
                placeholder="Search"
                className="border border-gray-400 p-2 rounded-md focus:outline-none"
              />
            </div>
          </div>

          <div className="w-full border-indigo-300 rounded-lg p-5 flex flex-row justify-center items-center gap-4">
            {["Annotated", "Not Annotated"].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-5 text-black font-medium border-b-2 bg-indigo-300 ${
                  activeTab === tab ? "border-indigo-600" : "border-gray-400"
                } focus:outline-none`}
                onClick={() => {
                  handleTabChange(tab);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {imagesToDisplay.map((image, index) => {
                const imageUrl = `${backendServiceUrl}media/tf_media/images/${image.processed_image}`;
                return (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      handleImageClick(image);
                    }}
                  >
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
              >
                Save and Continue
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
