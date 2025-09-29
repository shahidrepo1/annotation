import { useState } from "react";
import { toast } from "react-toastify";
import { LogoImageAnnotate } from "./LogoImageAnnotate";
import useAnnotateLogo from "../../../api/useAnnotateLogo";
import { Rectangle } from "./LogoImageAnnotateComponent/LogoCanvasControls";
import { ImageType } from "../../../api/useGetLogoData.types";
import { queryClient } from "../../../main";
import axios from "axios";
import { PiFolderOpenFill } from "react-icons/pi";
import useDeleteLogoChunks from "../../../api/useDeleteLogoChunks";
import { MdDelete } from "react-icons/md";
type LogoFolderDataDisplayProps = {
  logoData: { date: string; data: Array<ImageType> } | null;
  onCloseModal: () => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
  isTrained: boolean;
};

export const LogoFolderDataDisplay = ({
  logoData,
  onCloseModal,
  selectedIds,
  setSelectedIds,
  isTrained,
}: LogoFolderDataDisplayProps) => {
  const [annotations, setAnnotations] = useState<
    Record<string, Array<Rectangle>>
  >({});
  const [selectedImageData, setSelectedImageData] = useState<{
    label: ImageType["labels"][0];
    imageUrl: string;
  } | null>(null);

  const { mutate } = useAnnotateLogo();
  const { mutate: deleteMutate } = useDeleteLogoChunks();
  if (!logoData) return null;

  const handleImageClick = (
    label: ImageType["labels"][0],
    imageUrl: string
  ) => {
    setSelectedImageData({ label, imageUrl });
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
        onCloseModal();
        void queryClient.invalidateQueries({
          queryKey: ["LogoAnnotatedImage"],
        });
        void queryClient.invalidateQueries({ queryKey: ["logoTrainModel"] });
        setAnnotations({});
        setSelectedImageData(null);
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

  const handleDeleteImages = () => {
    if (selectedIds.length === 0) {
      toast.warning("No images selected for deletion.");
      return;
    }

    deleteMutate(selectedIds, {
      onSuccess: () => {
        toast.success("Images deleted successfully.");
        void queryClient.invalidateQueries({
          queryKey: ["LogoAnnotatedImage"],
        });
        setSelectedIds([]);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const err = error.response?.data as { message?: string };
          toast.error(err?.message || "Failed to delete images");
        } else {
          toast.error("Something went wrong.");
        }
      },
    });
  };
  return (
    <>
      {selectedImageData ? (
        <LogoImageAnnotate
          imageSrc={selectedImageData.imageUrl}
          initialRectangles={
            Array.isArray(annotations[selectedImageData.label.id]) &&
            annotations[selectedImageData.label.id].length > 0
              ? annotations[selectedImageData.label.id]
              : [
                  {
                    id: selectedImageData.label.id.toString(),
                    x: selectedImageData.label.x,
                    y: selectedImageData.label.y,
                    width: selectedImageData.label.width,
                    height: selectedImageData.label.height,
                    className: selectedImageData.label.name,
                  },
                ]
          }
          onClose={handleCloseAnnotation}
          onSaveAnnotation={({ rectangles }) => {
            const imageId = selectedImageData.label.id.toString();
            setAnnotations((prev) => ({
              ...prev,
              [imageId]: rectangles,
            }));
          }}
          isTrained={isTrained}
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-3 text-md font-semibold text-indigo-600 p-4 sticky top-0 z-10 bg-white shadow-sm border-b">
            <div className="flex items-center gap-3">
              <PiFolderOpenFill className="text-3xl" />
              <span className="text-lg">
                {logoData.data[0]?.uploaded_at?.split("T")[0]}
              </span>
            </div>

            {!isTrained && (
              <button
                onClick={handleDeleteImages}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
              >
                <MdDelete className="text-lg" /> Delete Selected
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {logoData.data.map((image) =>
                image.labels.map((label) => {
                  const imageUrl = image.image;
                  const isChecked = selectedIds.includes(label.id);
                  return (
                    <div
                      key={label.id}
                      className="relative group bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer border"
                      onClick={() => {
                        handleImageClick(label, imageUrl);
                      }}
                    >
                      <div
                        className="absolute top-2 left-2 z-10 p-1 rounded shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            toggleCheckbox(label.id);
                          }}
                        />
                      </div>

                      <img
                        src={imageUrl}
                        alt="processed"
                        className="w-full h-48 object-contain bg-gray-50"
                      />

                      <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs px-2 py-1 truncate">
                        {label.name}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white py-4 border-t border-gray-300 shadow-inner">
            <div className="flex justify-center">
              <button
                onClick={handleSaveAndContinue}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md shadow transition"
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
