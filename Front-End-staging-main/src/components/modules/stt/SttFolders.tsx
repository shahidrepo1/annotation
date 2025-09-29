import { PiFolderOpenFill } from "react-icons/pi";
import useSttSelectionStore from "../../../hooks/useSttSelectionStore";

export const SttFolders = ({
  folders,
  onFolderClick,
  folderDataMap,
  selectedFolders,
  onCheckboxChange,
  status,
}: {
  folders: Array<string>;
  onFolderClick: (folder: string) => void;
  folderDataMap: Record<string, Array<number>>;
  selectedFolders: Record<string, Array<number>>;
  onCheckboxChange: (folderName: string, chunkIds: Array<number>) => void;
  status: boolean;
}) => {
  const { selectedAudioIds } = useSttSelectionStore();
  const handleCheckboxChange = (
    folder: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const chunkIds = e.target.checked ? folderDataMap[folder] ?? [] : [];
    onCheckboxChange(folder, chunkIds);
  };

  return (
    <ul className="grid grid-cols-4 gap-7">
      {folders.map((folder, index) => {
        const totalFilesInFolder = folderDataMap[folder]?.length ?? 0;
        return (
          <li key={index} className="relative flex flex-col items-center">
            <div className="relative">
              <div className="absolute top-[-8px] left-[3px] flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={Boolean(selectedFolders?.[folder]?.length)}
                  onChange={(e) => {
                    handleCheckboxChange(folder, e);
                  }}
                />
              </div>
              <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {totalFilesInFolder}
              </div>
              <PiFolderOpenFill
                className={`text-8xl cursor-pointer ${
                  status &&
                  ((selectedFolders[folder]?.length ?? 0) > 0 ||
                    selectedAudioIds.some((id) =>
                      folderDataMap[folder]?.includes(id)
                    ))
                    ? "text-red-600 hover:text-red-500"
                    : "text-indigo-400 hover:text-indigo-500"
                }`}
                onClick={() => {
                  onFolderClick(folder);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">{folder}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default SttFolders;
