import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { ODModel } from "../../../api/useGetOdTrainedData.types";
import { ObjectTrainingImageDisplay } from "./ObjectTrainingImageDisplay";

type TrainingFoldersProps = {
  data: ODModel;
};

export const ObjectDetectionTrainingFolders = ({
  data,
}: TrainingFoldersProps) => {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleFolderClick = (label: string) => {
    setSelectedLabel(label);
  };

  const uniqueLabels = Array.from(
    new Set(
      data.trainedData.flatMap((img) =>
        img.detections.map((detection) => detection.label)
      )
    )
  );

  const selectedImages = data.trainedData.filter((img) =>
    img.detections.some((d) => d.label === selectedLabel)
  );

  return (
    <>
      <ul className="grid grid-cols-4 gap-7">
        {uniqueLabels.map((label) => (
          <li key={label} className="relative flex flex-col items-center">
            <div className="relative">
              <PiFolderOpenFill
                className="text-8xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
                onClick={() => {
                  handleFolderClick(label);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">{label}</p>
          </li>
        ))}
      </ul>

      {selectedLabel && selectedImages.length > 0 && (
        <div className="mt-8">
          <ObjectTrainingImageDisplay
            selectedVersion={{
              ...data,
              trainedData: selectedImages,
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
