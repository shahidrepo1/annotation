import { useState } from "react";
import { SentimentVersions } from "../components/modules/sentimentAnalysisTraining/SentimentVersions";
import SentimentTrainingData from "../components/modules/sentimentAnalysisTraining/SentimentTrainingData";
import SentimentTabs from "../components/modules/sentimentAnalysis/SentimentTabs";
import { Model } from "../api/useSentimentTrainedData.types";
export default function SentimentAnalysis() {
  const [selectedVersion, setSelectedVersion] = useState<Model | null>(null);

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <SentimentVersions
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>
        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Sentiment Analysis
            </h1>
            <p>
              Helps identify and label sentiments in your audio files with
              timestamp.
            </p>
          </section>
          {selectedVersion ? (
            <SentimentTrainingData selectedVersion={selectedVersion} />
          ) : (
            <>
              <section className="mt-4">
                <SentimentTabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
