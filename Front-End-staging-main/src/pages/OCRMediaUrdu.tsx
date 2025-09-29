import { useState } from "react";
import { OCRMediaVersions } from "../components/modules/ocrMediaUrduTraining/OCRMediaUrduTrainingVersions";
import OCRMediaTrainingData from "../components/modules/ocrMediaUrduTraining/OCRMediaUrduTrainingData";
import OCRMediaTabs from "../components/modules/ocrMediaUrdu/OCRMediaUrduTabs";
import { TrainingModel } from "../api/useGetOcrTrainedData.types";

export default function OCRMediaUrdu() {
  const [selectedVersion, setSelectedVersion] = useState<TrainingModel | null>(
    null
  );

  return (
    <main className="p-1">
      <div className="flex gap-4">
        <div>
          <OCRMediaVersions
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>

        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-2xl pl-3">
              OCR - Urdu Media
            </h1>
            <p className="p-3">
              Helps identify and label Optical Character in your videos and
              images files.
            </p>
          </section>
          {selectedVersion ? (
            <OCRMediaTrainingData selectedVersion={selectedVersion} />
          ) : (
            <>
              <section className="mt-4">
                <OCRMediaTabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
