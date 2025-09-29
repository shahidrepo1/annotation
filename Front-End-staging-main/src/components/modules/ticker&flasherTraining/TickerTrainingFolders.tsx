import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { ModelInfoType } from "../../../api/useTfTrainedData.types";
import { TickerTrainingImageDisplay } from "./TickerTrainingImageDisplay";

type TickerTrainingFoldersProps = {
  data: ModelInfoType;
};

export const TickerTrainingFolders = ({ data }: TickerTrainingFoldersProps) => {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleFolderClick = (label: string) => {
    setSelectedLabel(label);
  };

  const selectedTrainedData = data.trainedData.find(
    (td) => td.label === selectedLabel
  );

  return (
    <>
      <ul className="grid grid-cols-4 gap-7">
        {data.trainedData.map((trainedItem) => (
          <li
            key={trainedItem.label}
            className="relative flex flex-col items-center"
          >
            <div className="relative">
              <PiFolderOpenFill
                className="text-8xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
                onClick={() => {
                  handleFolderClick(trainedItem.label);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {trainedItem.label}
            </p>
          </li>
        ))}
      </ul>

      {selectedLabel && selectedTrainedData && (
        <div className="mt-8">
          <TickerTrainingImageDisplay
            selectedVersion={{
              ...data,
              trainedData: [selectedTrainedData],
            }}
            closeModal={() => {
              setSelectedLabel(null);
            }}
          />
        </div>
      )}
    </>
  );
};
