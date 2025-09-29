import { useState } from "react";
// import OCRMediaTabs from "../components/modules/ocrMediaUrdu/OCRMediaUrduTabs";
// import { TrainingModel } from "../api/useGetOcrTrainedData.types";
import { OCRDocUrduTrainedData } from "../components/modules/ocrDocUrdu/OCRDocUrduTrainedData";
import { OCRDocUrduVersions } from "../components/modules/ocrDocUrduTraining/OCRDocUrduVersions";
import OCRDocUrduTabs from "../components/modules/ocrDocUrdu/OCRDocUrduTabs";

export default function OCRDocUrdu() {
  const [selectedVersion] = useState<null>(null);

  return (
    <main className="p-1">
      <div className="flex gap-4">
        <div>
          <OCRDocUrduVersions
          // onSelectVersion={(dailyVersion) => {
          //   setSelectedVersion(dailyVersion);
          // }}
          />
        </div>

        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-2xl pl-3">
              OCR - Urdu Document
            </h1>
            <p className="p-3">
              Helps identify and label Optical Character in your Documents.
            </p>
          </section>
          {selectedVersion ? (
            <OCRDocUrduTrainedData />
          ) : (
            <>
              <section className="mt-4">
                <OCRDocUrduTabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
