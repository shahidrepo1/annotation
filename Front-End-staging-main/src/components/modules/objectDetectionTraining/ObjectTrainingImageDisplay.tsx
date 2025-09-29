import { ODModel } from "../../../api/useGetOdTrainedData.types";
import { backendServiceUrl } from "../../../api/apiConstants";
import { IoClose } from "react-icons/io5";

type Props = {
  selectedVersion: ODModel;
  closeModal: () => void;
};

export const ObjectTrainingImageDisplay = ({
  selectedVersion,
  closeModal,
}: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white w-[900px] max-h-[80vh] px-6 py-8 rounded-xl mx-auto shadow-lg border border-indigo-600">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          aria-label="Close Modal"
        >
          <IoClose />
        </button>

        <div
          className="space-y-6 overflow-y-auto pr-2"
          style={{ maxHeight: "70vh" }}
        >
          {selectedVersion.trainedData.map((imageData) => {
            const imageUrl = `${backendServiceUrl.replace(
              /\/$/,
              ""
            )}/media/od_media/images/${imageData.processedImage.replace(
              /^\//,
              ""
            )}`;

            return (
              <div key={imageData.image_id}>
                <div className="relative border rounded-md overflow-hidden w-full">
                  <img
                    src={imageUrl}
                    alt={`Trained image ${String(imageData.image_id)}`}
                    className="w-full h-auto object-contain"
                  />
                  {imageData.detections.map((det, idx) => (
                    <div
                      key={idx}
                      className="absolute border-2 border-red-500"
                      style={{
                        top: `${String(det.y)}px`,
                        left: `${String(det.x)}px`,
                        width: `${String(det.width)}px`,
                        height: `${String(det.height)}px`,
                        pointerEvents: "none",
                      }}
                    >
                      <div className="absolute top-[-20px] left-0 bg-red-500 text-white text-xs px-1 rounded">
                        {det.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
