import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { Models } from "../../../api/useGetAdTrainedData.types";
import { AdTrainingModal } from "./AdTrainingModal";
type AdTrainingFoldersProps = {
  data: Models;
};

export const AdTraningFolders = ({ data }: AdTrainingFoldersProps) => {
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
        <AdTrainingModal
          setIsModalOpen={() => {
            setSelectedLabel(null);
          }}
          selectedVersion={data}
        />
      )}
    </>
  );
};
