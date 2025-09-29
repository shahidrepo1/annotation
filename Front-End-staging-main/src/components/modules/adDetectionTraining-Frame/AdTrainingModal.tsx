import { backendServiceUrl } from "../../../api/apiConstants";
import { Models } from "../../../api/useGetAdTrainedData.types";

type AdModalProps = {
  setIsModalOpen: (open: boolean) => void;
  selectedVersion: Models;
};

export const AdTrainingModal = ({
  setIsModalOpen,
  selectedVersion,
}: AdModalProps) => {
  const trainedItems = selectedVersion.trainedData;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 space-y-4 bg-white w-[900px] min-h-[450px] h-fit px-6 rounded-xl mx-auto shadow-lg border border-indigo-600 overflow-auto">
        <div
          className={`max-h-[700px] space-y-4 ${
            trainedItems.length > 1 ? "overflow-y-auto" : ""
          }`}
        >
          {trainedItems.length === 0 ? (
            <p className="text-center text-red-600">No trained data found</p>
          ) : (
            <div className="flex justify-center my-4 h-64">
              <div className="flex-1 border border-gray-200 overflow-y-scroll">
                {trainedItems.map((item, index) => (
                  <div key={index} className="flex items-center p-2 border-b">
                    <div className="w-7/12">
                      {item.segments.map((img, imgIndex) => (
                        <video
                          key={imgIndex}
                          src={`${backendServiceUrl}${img.media_file}`}
                          className="object-contain h-40 mx-auto p-2"
                          controls
                        />
                      ))}
                    </div>
                    <div className="w-5/12 pl-4 flex flex-col space-y-2">
                      <div className="flex items-center h-40">
                        <p className="font-medium bg-indigo-500 text-white px-2 py-1 rounded">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
