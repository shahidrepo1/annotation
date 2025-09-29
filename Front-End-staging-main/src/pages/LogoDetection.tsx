import { useState } from "react";
import { LDVersion } from "../components/modules/logoDetectionVersion/LDVersion";
import { LDTabs } from "../components/modules/logo detection/LDTabs";
import { LogoModel } from "../api/useLogoTrainedData.types";
import LDTrainingData from "../components/modules/logoDetectionVersion/LDTrainingData";
import { IoArrowBack } from "react-icons/io5";
import { LDModal } from "../components/modules/logo detection/LDModal";
import LDUploadMediaModal from "../components/modules/logo detection/LDUploadMediaModal";
import { LogoImageList } from "../api/useLogoResponse.types";

export default function LogoDetection() {
  const [selectedVersion, setSelectedVersion] = useState<LogoModel | null>(
    null
  );
  const [showUploadView, setShowUploadView] = useState(false);
  const [showTrainingView, setShowTrainingView] = useState(false);
  const [logoData, setLogoData] = useState<LogoImageList | null>(null);

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <LDVersion
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>

        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Logo Detection
            </h1>
            <p>Helps identify and label speakers in your Videos and images.</p>
          </section>

          <section className="mt-4">
            {selectedVersion ? (
              <LDTrainingData selectedVersion={selectedVersion} />
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
                <LDModal
                  logoData={logoData}
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
                  <LDUploadMediaModal
                    setOpen={setShowUploadView}
                    setLogoData={(data) => {
                      setLogoData(data);
                      setShowTrainingView(true);
                    }}
                    logoData={logoData}
                  />
                </div>
              </div>
            ) : (
              <LDTabs />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
