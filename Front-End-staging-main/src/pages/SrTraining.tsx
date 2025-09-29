import { useState } from "react";
import Tabs from "../components/modules/speakerRecognition/SrTabs";
import VersionList from "../components/modules/speakerRecognition/VersionsList";
import SrTrainedData from "../components/modules/srTraining/SrTrainedData";
import { SrTrainedDataObjectType } from "../api/useGetSrTrainedData.types";

export default function SrTraining() {
  const [selectedVersion, setSelectedVersion] =
    useState<SrTrainedDataObjectType | null>(null);

  return (
    <main>
      <div className="flex gap-4">
        <div>
          <VersionList onSelectVersion={setSelectedVersion} />
        </div>
        <div className="flex-grow">
          <section>
            <h1 className="text-indigo-500 font-bold text-xl">
              Speaker Recognition
            </h1>
            <p>
              Helps identify and label speakers in your audio files with
              timestamp.
            </p>
          </section>
          {selectedVersion ? (
            <SrTrainedData selectedVersion={selectedVersion} />
          ) : (
            <>
              <section className="mt-4">
                <Tabs />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
