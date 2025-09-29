import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { ModelType } from "../../../api/useGetFrTrainedData.types";
import { FrTrainingModal } from "./FrTrainingModal";

type SttTrainingFoldersProps = {
  data: ModelType;
};

export const FrTrainingFolders = ({ data }: SttTrainingFoldersProps) => {
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
        <FrTrainingModal
          setIsModalOpen={() => {
            setSelectedLabel(null);
          }}
          selectedVersion={data}
          trainedData={selectedTrainedData}
        />
      )}
    </>
  );
};
