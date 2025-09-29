import { useState } from "react";
import { DailyVersionType } from "../api/useGetSttTrainedData.types";
import SttTabs from "../components/modules/stt/SttTabs";
import SttVersion from "../components/modules/sttTraining/SttVersion";
import SttTrainingData from "../components/modules/sttTraining/SttTrainingData";

export default function Stt() {
  const [selectedVersion, setSelectedVersion] =
    useState<DailyVersionType | null>(null);

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <SttVersion
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>
        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Speech to Text
            </h1>
            <p>
              Helps identify and label speakers in your audio files with
              timestamp.
            </p>
          </section>
          {selectedVersion ? (
            <SttTrainingData selectedVersion={selectedVersion} />
          ) : (
            <>
              <section className="mt-4">
                <SttTabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
