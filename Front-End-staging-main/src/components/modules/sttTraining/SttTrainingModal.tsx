import { DailyVersionType } from "../../../api/useGetSttTrainedData.types";
import { backendServiceUrl } from "../../../api/apiConstants";

type SttModalProps = {
  setIsModalOpen: (open: boolean) => void;
  selectedVersion: DailyVersionType;
};

export const SttTrainingModal = ({
  setIsModalOpen,
  selectedVersion,
}: SttModalProps) => {
  const version = selectedVersion.versions[0];
  const trainedItems = version.progress.flatMap(
    (progress) => progress.trainedData
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 space-y-4 bg-white w-[900px] min-h-[450px] h-fit px-6 rounded-xl mx-auto shadow-lg border border-indigo-600 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">
          Trained Data – Version {version.version_name}
        </h2>

        <div
          className={`max-h-[350px] space-y-4 ${
            trainedItems.length > 1 ? "overflow-y-auto" : ""
          }`}
        >
          {trainedItems.length === 0 ? (
            <p className="text-center text-red-600">No trained data found</p>
          ) : (
            trainedItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr] gap-x-3 border border-black p-4 items-center"
              >
                <div className="flex flex-col justify-center">
                  <audio controls className="w-full mt-2">
                    <source
                      src={`${backendServiceUrl}media/stt_chunks/${item.audio}`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="relative">
                  <h2 className="text-lg font-bold">Transcription</h2>
                  <p
                    className="font-aslam text-lg font-bold text-justify"
                    dir="rtl"
                  >
                    {item.transcription}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setIsModalOpen(false);
            }}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
