import { useState } from "react";
import { ObjectDetectionVersion } from "../components/modules/objectDetectionTraining/ObjectDetectionVersion";
import { ObjectDetectionTabs } from "../components/modules/objectDetection/ObjectDetectionTabs";
import { ProcessedDataResponse } from "../api/useObjectResponse.types";
import { IoArrowBack } from "react-icons/io5";
import { ObjectDetectionImageDisplay } from "../components/modules/objectDetection/ObjectDetectionImageDisplay";
import { ObjectDetectionUploadMediaModal } from "../components/modules/objectDetection/ObjectDetectionUploadMediaModal";
import ObjectDetectionTrainingData from "../components/modules/objectDetectionTraining/ObjectDetectionTrainingData";
import { ODModel } from "../api/useGetOdTrainedData.types";
export default function ObjectDetection() {
  const [selectedVersion, setSelectedVersion] = useState<ODModel | null>(null);
  const [showUploadView, setShowUploadView] = useState(false);
  const [showTrainingView, setShowTrainingView] = useState(false);
  const [odData, setodData] = useState<ProcessedDataResponse | null>(null);

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <ObjectDetectionVersion
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>

        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Object Detection
            </h1>
            <p>Helps identify and label speakers in your Videos and Images.</p>
          </section>

          <section className="mt-4">
            {selectedVersion ? (
              <ObjectDetectionTrainingData selectedVersion={selectedVersion} />
            ) : showTrainingView ? (
              <div className="bg-white rounded-lg p-6 w-full relative">
                <button
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-800 mb-4"
                  onClick={() => {
                    setShowTrainingView(false);
                  }}
                >
                  <IoArrowBack className="text-xl text-indigo-500" />
                  Back to Upload
                </button>
                <ObjectDetectionImageDisplay
                  odData={odData}
                  onCloseModal={() => {
                    setShowTrainingView(false);
                  }}
                />
              </div>
            ) : showUploadView ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
                  <button
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-800 mb-4"
                    onClick={() => {
                      setShowUploadView(false);
                    }}
                  >
                    <IoArrowBack className="text-xl" />
                    Back to Tabs
                  </button>
                  <ObjectDetectionUploadMediaModal
                    setOpen={setShowUploadView}
                    setOdData={(data) => {
                      setodData(data);
                      setShowTrainingView(true);
                    }}
                    odData={odData}
                  />
                </div>
              </div>
            ) : (
              <ObjectDetectionTabs />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
