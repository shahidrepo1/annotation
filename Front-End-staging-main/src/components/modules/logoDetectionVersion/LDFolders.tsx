import { useState } from "react";
import { PiFolderOpenFill } from "react-icons/pi";
import {
  LogoModel,
  LogoTrainedGroup,
} from "../../../api/useLogoTrainedData.types";
import { LDImageDisplay } from "./LDImageDisplay";

type Props = {
  data: LogoModel;
};

export const LDFolders = ({ data }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<LogoTrainedGroup | null>(
    null
  );

  const handleFolderClick = (group: LogoTrainedGroup) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  return (
    <>
      <ul className="grid grid-cols-4 gap-7">
        {data.trainedData.map((group) => (
          <li key={group.date} className="relative flex flex-col items-center">
            <div className="relative">
              <PiFolderOpenFill
                className="text-8xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
                onClick={() => {
                  handleFolderClick(group);
                }}
              />
              <span className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {group.data.length}
              </span>
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {group.date}
            </p>
          </li>
        ))}
      </ul>

      {modalOpen && selectedGroup && (
        <LDImageDisplay
          folderDate={selectedGroup.date}
          images={selectedGroup.data}
          closeModal={() => {
            setModalOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </>
  );
};
