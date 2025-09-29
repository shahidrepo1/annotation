import { PiFolderOpenFill } from "react-icons/pi";
import { ImageType } from "../../../api/useGetLogoData.types";

type Props = {
  data: Array<{
    date: string;
    data: Array<ImageType>;
  }>;
  onFolderClick: (folder: { date: string; data: Array<ImageType> }) => void;
  selectedIds: Array<number>;
  onFolderCheckboxToggle: (
    folder: {
      date: string;
      data: Array<ImageType>;
    },
    checked: boolean
  ) => void;
  isTrained?: boolean;
};

export const LogoDetectionFolders = ({
  data,
  onFolderClick,
  selectedIds,
  onFolderCheckboxToggle,
  isTrained,
}: Props) => {
  return (
    <ul className="grid grid-cols-4 gap-7">
      {data.map((folderGroup, index) => {
        const allSelected = folderGroup.data.every((img) =>
          img.labels.every((label) => selectedIds.includes(label.id))
        );

        const totalLabels = folderGroup.data.reduce(
          (sum, img) => sum + img.labels.length,
          0
        );

        return (
          <li key={index} className="relative flex flex-col items-center">
            <div className="relative">
              <div className="absolute top-[-8px] left-[3px] flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={allSelected}
                  onChange={(e) => {
                    onFolderCheckboxToggle(folderGroup, e.target.checked);
                  }}
                />
              </div>
              <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {totalLabels}
              </div>
              <PiFolderOpenFill
                className={`text-8xl ${
                  isTrained && allSelected
                    ? "text-red-500 hover:text-red-600"
                    : "text-indigo-400 hover:text-indigo-500"
                } cursor-pointer`}
                onClick={() => {
                  onFolderClick(folderGroup);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {folderGroup.date}
            </p>
          </li>
        );
      })}
    </ul>
  );
};
