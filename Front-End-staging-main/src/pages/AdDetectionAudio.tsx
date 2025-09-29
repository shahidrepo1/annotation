import { useState } from "react";
import AdAudioTabs from "../components/modules/adDetection-Audio/AdAudioTabs";
import { AdVersion } from "../components/modules/adDetectionTraining-Frame/AdVersion";
import { Models } from "../api/useGetAdTrainedData.types";
import AdTrainingData from "../components/modules/adDetectionTraining-Frame/AdTrainingData";

export default function AdDetectionAudio() {
  const [selectedVersion, setSelectedVersion] = useState<Models | null>(null);
  return (
    <main>
      <div className="flex gap-4">
        <div>
          <AdVersion
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>

        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Ad Detection - Audio
            </h1>
            <p>Detects and Timestamp advertisements witin video content.</p>
          </section>
          {selectedVersion ? (
            <AdTrainingData selectedVersion={selectedVersion} />
          ) : (
            <>
              <section className="mt-4">
                <AdAudioTabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
