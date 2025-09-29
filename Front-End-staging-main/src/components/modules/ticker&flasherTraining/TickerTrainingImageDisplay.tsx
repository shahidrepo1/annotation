import { ModelInfoType } from "../../../api/useTfTrainedData.types";
import { backendServiceUrl } from "../../../api/apiConstants";
import { IoClose } from "react-icons/io5";

type Props = {
  selectedVersion: ModelInfoType;
  closeModal: () => void;
};

export const TickerTrainingImageDisplay = ({
  selectedVersion,
  closeModal,
}: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative p-8 space-y-4 bg-white w-[900px] max-h-[80vh] overflow-auto px-6 rounded-xl mx-auto shadow-lg border border-indigo-600">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          aria-label="Close Modal"
        >
          <IoClose />
        </button>

        <div className="space-y-6">
          {selectedVersion.trainedData.map((labelGroup) => (
            <div key={labelGroup.label}>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">
                Folder: {labelGroup.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {labelGroup.images.map((img) => {
                  const imageUrl = `${backendServiceUrl.replace(
                    /\/$/,
                    ""
                  )}/media/tf_media/images/${img.processedImage}`;

                  return (
                    <div
                      key={img.id}
                      className="relative border rounded-md overflow-hidden"
                    >
                      <img
                        src={imageUrl}
                        alt={`Trained image`}
                        className="w-full h-auto object-contain"
                      />
                      <div
                        className="absolute border-2 border-red-500"
                        style={{
                          top: `${String(img.y)}px`,
                          left: `${String(img.x)}px`,
                          width: `${String(img.width)}px`,
                          height: `${String(img.height)}px`,
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 text-white text-xs bg-red-500 bg-opacity-80 px-1 rounded-br"
                          style={{
                            maxWidth: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {labelGroup.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
