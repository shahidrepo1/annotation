import { useState } from "react";
import TickerTabs from "../components/modules/ticker&flasher/TickerTabs";
import { TickerVersion } from "../components/modules/ticker&flasherTraining/TickerVersion";
import { TickerUploadMediaModal } from "../components/modules/ticker&flasher/TickerUploadMediaModal";
import { TickerResponse } from "../api/useTickerUpload.types";
import { TickerModal } from "../components/modules/ticker&flasher/TickerModal";
import { IoArrowBack } from "react-icons/io5";
import { ModelInfoType } from "../api/useTfTrainedData.types";
import TickerTrainingData from "../components/modules/ticker&flasherTraining/TickerTrainingData";

export default function TickerAndFlasher() {
  const [showUploadView, setShowUploadView] = useState(false);
  const [showTrainingView, setShowTrainingView] = useState(false);
  const [tfData, setTfData] = useState<TickerResponse | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ModelInfoType | null>(
    null
  );

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <TickerVersion
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>

        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Ticker and Flasher
            </h1>
            <p>Helps identify and label speakers in your Videos and images.</p>
          </section>

          <section className="mt-4">
            {selectedVersion ? (
              <TickerTrainingData selectedVersion={selectedVersion} />
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
                <TickerModal
                  tfData={tfData}
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
                  <TickerUploadMediaModal
                    setOpen={setShowUploadView}
                    setTfData={(data) => {
                      setTfData(data);
                      setShowTrainingView(true);
                    }}
                    tfData={tfData}
                  />
                </div>
              </div>
            ) : (
              <TickerTabs />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
