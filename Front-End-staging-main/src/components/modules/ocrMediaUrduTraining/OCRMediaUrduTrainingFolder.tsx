import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { OCRMediaUrduTrainingModal } from "./OCRMediaUrduTrainingModal";
import { TrainingModel } from "../../../api/useGetOcrTrainedData.types";

type AdTrainingFoldersProps = {
  data: TrainingModel;
};

export const OCRMediaUrduTrainingFolder = ({
  data,
}: AdTrainingFoldersProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleFolderClick = (date: string) => {
    setSelectedDate(date);
  };

  const selectedTrainedData = data.trainedData.find(
    (td) => td.date === selectedDate
  );

  return (
    <>
      <ul className="grid grid-cols-4 gap-7">
        {data.trainedData.map((trainedItem) => (
          <li
            key={trainedItem.date}
            className="relative flex flex-col items-center"
          >
            <div className="relative">
              <PiFolderOpenFill
                className="text-8xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
                onClick={() => {
                  handleFolderClick(trainedItem.date);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {trainedItem.date}
            </p>
          </li>
        ))}
      </ul>

      {selectedDate && selectedTrainedData && (
        <OCRMediaUrduTrainingModal
          setIsModalOpen={() => {
            setSelectedDate(null);
          }}
          selectedVersion={selectedTrainedData}
        />
      )}
    </>
  );
};
