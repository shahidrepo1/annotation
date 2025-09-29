import { backendServiceUrl } from "../../../api/apiConstants";
import {
  ModelType,
  TrainedDataType,
} from "../../../api/useGetFrTrainedData.types";

type FrModalProps = {
  setIsModalOpen: (open: boolean) => void;
  selectedVersion: ModelType;
  trainedData: TrainedDataType;
};

export const FrTrainingModal = ({
  setIsModalOpen,
  trainedData,
}: FrModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 space-y-4 bg-white w-[900px] min-h-[450px] h-fit px-6 rounded-xl mx-auto shadow-lg border border-indigo-600 overflow-auto">
        <div
          className={`max-h-[700px] space-y-4 ${
            trainedData.images.length > 1 ? "overflow-y-auto" : ""
          }`}
        >
          {trainedData.images.length === 0 ? (
            <p className="text-center text-red-600">No trained images found</p>
          ) : (
            <div className="flex justify-center my-4 h-64">
              <div className="flex-1 border border-gray-200 overflow-y-scroll">
                <div className="flex items-center p-2 border-b">
                  <div className="w-7/12">
                    {trainedData.images.map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={`${backendServiceUrl.replace(/\/$/, "")}${
                          img.processedImage
                        }`}
                        alt="Processed content"
                        className="object-contain h-40 mx-auto"
                      />
                    ))}
                  </div>
                  <div className="w-5/12 pl-4 flex flex-col space-y-2">
                    {trainedData.images.map((img, imgIndex) => (
                      <div key={imgIndex} className="flex items-center h-40">
                        <p className="font-medium bg-indigo-500 text-white px-2 py-1 rounded">
                          {img.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setIsModalOpen(false);
            }}
            className="mt-1 px-4 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
