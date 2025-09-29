import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { Model, TrainedItem } from "../../../api/useSentimentTrainedData.types";
import { SentimentTrainingModal } from "./SentimentTrainingModal";

type TrainingFoldersProps = {
  data: Model;
};

export const SentimentTrainingFolders = ({ data }: TrainingFoldersProps) => {
  const [selectedLabel, setSelectedLabel] = useState<
    "positive" | "neutral" | "negative" | null
  >(null);

  const handleFolderClick = (label: "positive" | "neutral" | "negative") => {
    setSelectedLabel(label);
  };

  // Extract available sentiment categories from trainedData
  const availableLabels = Object.entries(data.trainedData)
    .filter(([, items]) => Array.isArray(items) && items.length > 0)
    .map(([label]) => label as "positive" | "neutral" | "negative");

  const selectedItems: Array<TrainedItem> =
    (selectedLabel && data.trainedData[selectedLabel]) || [];

  return (
    <>
      <ul className="grid grid-cols-4 gap-7">
        {availableLabels.map((label) => (
          <li key={label} className="relative flex flex-col items-center">
            <div className="relative">
              <PiFolderOpenFill
                className="text-8xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
                onClick={() => {
                  handleFolderClick(label);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600 capitalize">
              {label}
            </p>
          </li>
        ))}
      </ul>
      {selectedLabel && selectedItems.length > 0 && (
        <SentimentTrainingModal
          items={selectedItems}
          sentiment={selectedLabel}
          closeModal={() => {
            setSelectedLabel(null);
          }}
        />
      )}
    </>
  );
};
