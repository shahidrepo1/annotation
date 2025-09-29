import { useState } from "react";
import { FrVersion } from "../components/modules/frTraining/FrVersion";
import FrTabs from "../components/modules/facialRecognition/FrTabs";
import { ModelType } from "../api/useGetFrTrainedData.types";
import FrTrainingData from "../components/modules/frTraining/FrTrainingData";
export default function FacialRecognition() {
  const [selectedVersion, setSelectedVersion] = useState<ModelType | null>(
    null
  );

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <FrVersion
            onSelectVersion={(dailyVersion) => {
              setSelectedVersion(dailyVersion);
            }}
          />
        </div>
        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Facial Recognition
            </h1>
            <p>Identifies and labels faces in your video.</p>
          </section>
          {selectedVersion ? (
            <FrTrainingData selectedVersion={selectedVersion} />
          ) : (
            <>
              <section className="mt-4">
                <FrTabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
