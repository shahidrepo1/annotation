import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import { DailyVersionType } from "../../../api/useGetSttTrainedData.types";
import { SttTrainingModal } from "./SttTrainingModal";

type SttTrainingFoldersProps = {
  data: DailyVersionType;
};

export const SttTrainingFolders = ({ data }: SttTrainingFoldersProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleFolderClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <ul className="grid grid-cols-4 gap-7">
        <li className="relative flex flex-col items-center">
          <div className="relative">
            <PiFolderOpenFill
              className="text-8xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
              onClick={handleFolderClick}
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">{data.date}</p>
        </li>
      </ul>

      {modalOpen && (
        <SttTrainingModal
          setIsModalOpen={setModalOpen}
          selectedVersion={data}
        />
      )}
    </>
  );
};
