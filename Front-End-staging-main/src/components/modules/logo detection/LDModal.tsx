import { LogoImageAnnotate } from "./LogoImageAnnotate";
import { useState } from "react";
import useAnnotateLogo from "../../../api/useAnnotateLogo";
import { toast } from "react-toastify";
import { LogoImageList } from "../../../api/useLogoResponse.types";
import { Rectangle } from "./LogoImageAnnotateComponent/LogoCanvasControls";
import axios from "axios";
import { backendServiceUrl } from "../../../api/apiConstants";
import { queryClient } from "../../../main";

type TickerModalProps = {
  logoData: LogoImageList | null;
  onCloseModal: () => void;
  isTrained?: boolean;
};

export const LDModal = ({
  logoData,
  onCloseModal,
  isTrained,
}: TickerModalProps) => {
  const [activeTab, setActiveTab] = useState("Not Annotated");
  const [annotations, setAnnotations] = useState<
    Record<string, Array<Rectangle>>
  >({});
  const tabs = ["Annotated", "Not Annotated"];
  const [selectedImageData, setSelectedImageData] = useState<
    LogoImageList["data"][0] | null
  >(null);
  const { mutate } = useAnnotateLogo();
  if (!logoData) return null;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const handleImageClick = (image: (typeof logoData.data)[0]) => {
    setSelectedImageData(image);
  };

  const handleCloseAnnotation = () => {
    setSelectedImageData(null);
  };

  const handleSaveAndContinue = () => {
    const payload = Object.entries(annotations).map(
      ([imageId, rectangles]) => ({
        id: parseInt(imageId),
        labels: rectangles.map((rect) => ({
          name: rect.className ?? "Unlabeled",
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        })),
      })
    );

    if (payload.length === 0) {
      toast.warning("No annotations to save.");
      return;
    }

    mutate(payload, {
      onSuccess: () => {
        toast.success("Annotations saved successfully.");
        void queryClient.invalidateQueries({
          queryKey: ["LogoAnnotatedImage"],
        });
        void queryClient.invalidateQueries({ queryKey: ["logoTrainModel"] });
        void queryClient.invalidateQueries({ queryKey: ["LogoLabel"] });
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
      ? logoData.data.filter((image) => {
          const annotated = annotations[image.id];
          return Array.isArray(annotated) && annotated.length > 0;
        })
      : logoData.data.filter((image) => {
          const annotated = annotations[image.id];
          return !Array.isArray(annotated) || annotated.length === 0;
        });
  return (
    <>
      {selectedImageData ? (
        <LogoImageAnnotate
          imageSrc={`${backendServiceUrl}${
            selectedImageData.image.startsWith("/")
              ? selectedImageData.image.slice(1)
              : selectedImageData.image
          }`}
          initialRectangles={
            Array.isArray(annotations[selectedImageData.id]) &&
            annotations[selectedImageData.id].length > 0
              ? annotations[selectedImageData.id]
              : selectedImageData.labels.length > 0
              ? [
                  {
                    id: selectedImageData.labels[0].id.toString(),
                    x: selectedImageData.labels[0].x,
                    y: selectedImageData.labels[0].y,
                    width: selectedImageData.labels[0].width,
                    height: selectedImageData.labels[0].height,
                    className: selectedImageData.labels[0].name,
                  },
                ]
              : []
          }
          onClose={handleCloseAnnotation}
          onSaveAnnotation={({ rectangles }) => {
            const imageId = selectedImageData.id.toString();

            //  original labels for comparison
            const originalLabels = selectedImageData.labels.map((label) => ({
              name: label.name,
              x: label.x,
              y: label.y,
              width: label.width,
              height: label.height,
            }));

            const newRects = rectangles.map((rect) => ({
              name: rect.className ?? "Unlabeled",
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            }));

            const isChanged =
              originalLabels.length !== newRects.length ||
              originalLabels.some((label, index) => {
                const newRect = newRects[index];
                return (
                  label.name !== newRect.name ||
                  label.x !== newRect.x ||
                  label.y !== newRect.y ||
                  label.width !== newRect.width ||
                  label.height !== newRect.height
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
          isTrained={isTrained}
        />
      ) : (
        <>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col">
              Batch Name:
              <div className="border border-gray-400 p-2 rounded-md focus:outline-none">
                {logoData.data[0]?.uploaded_at}
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
              {imagesToDisplay.map((image, index) => {
                const imageUrl = `${backendServiceUrl}${
                  image.image.startsWith("/")
                    ? image.image.slice(1)
                    : image.image
                }`;
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
