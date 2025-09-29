import { useState } from "react";
import { ProcessedDataResponse } from "../../../api/useObjectResponse.types";
import { backendServiceUrl } from "../../../api/apiConstants";
import { ObjectImageAnnotate } from "./ObjectImageAnnotate";
import { Rectangle } from "../logo detection/LogoImageAnnotateComponent/LogoCanvasControls";
import useOdProcessedImage from "../../../api/useOdProcessedImage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type OdModalProps = {
  odData: ProcessedDataResponse | null;
  onCloseModal: () => void;
};

export const ObjectDetectionImageDisplay = ({
  odData,
  onCloseModal,
}: OdModalProps) => {
  const [activeTab, setActiveTab] = useState("Not Annotated");
  const [annotations, setAnnotations] = useState<
    Record<string, Array<Rectangle>>
  >({});
  const tabs = ["Annotated", "Not Annotated"];
  const [selectedImageData, setSelectedImageData] = useState<
    ProcessedDataResponse["data"][0] | null
  >(null);
  const { mutate } = useOdProcessedImage();
  const queryClient = useQueryClient();
  if (!odData) return null;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const handleImageClick = (image: (typeof odData.data)[0]) => {
    setSelectedImageData(image);
  };

  const handleCloseAnnotation = () => {
    setSelectedImageData(null);
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
  const imagesToDisplay =
    activeTab === "Annotated"
      ? odData.data.filter((image) => {
          const annotated = annotations[image.id];
          return Array.isArray(annotated) && annotated.length > 0;
        })
      : odData.data.filter((image) => {
          const annotated = annotations[image.id];
          return !Array.isArray(annotated) || annotated.length === 0;
        });
  return (
    <>
      {selectedImageData ? (
        <ObjectImageAnnotate
          imageSrc={`${backendServiceUrl.replace(
            /\/$/,
            ""
          )}/media/od_media/images/${selectedImageData.processed_image.replace(
            /^\//,
            ""
          )}`}
          initialRectangles={
            Array.isArray(annotations[selectedImageData.id]) &&
            annotations[selectedImageData.id].length > 0
              ? annotations[selectedImageData.id]
              : selectedImageData.detections.map((detection) => ({
                  id: detection.id.toString(),
                  x: detection.x,
                  y: detection.y,
                  width: detection.width,
                  height: detection.height,
                  className: detection.label.label_name,
                }))
          }
          onClose={handleCloseAnnotation}
          onSaveAnnotation={({ rectangles }) => {
            const imageId = selectedImageData?.id?.toString() ?? "";

            // Compare with original detections
            const originalRects = selectedImageData?.detections.map(
              (detection) => ({
                label: detection.label.label_name,
                x: detection.x,
                y: detection.y,
                width: detection.width,
                height: detection.height,
              })
            );

            const newRects = rectangles.map((rect) => ({
              label: rect.className ?? "Unlabeled",
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            }));

            const isChanged =
              originalRects.length !== newRects.length ||
              originalRects.some((orig, i) => {
                const newR = newRects[i];
                return (
                  orig.label !== newR.label ||
                  orig.x !== newR.x ||
                  orig.y !== newR.y ||
                  orig.width !== newR.width ||
                  orig.height !== newR.height
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
        />
      ) : (
        <>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col">
              Batch Name:
              <div className="border border-gray-400 p-2 rounded-md focus:outline-none">
                {odData.data[0]?.start_time}
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
            {tabs.map((tab) => (
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
              {imagesToDisplay.map((image) => {
                const imageUrl = `${backendServiceUrl.replace(
                  /\/$/,
                  ""
                )}/media/od_media/images/${image.processed_image.replace(
                  /^\//,
                  ""
                )}`;

                return (
                  <div
                    key={image.id}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      handleImageClick(image);
                    }}
                  >
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
        </>
      )}
    </>
  );
};
