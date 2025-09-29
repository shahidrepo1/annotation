import { PiFolderOpenFill } from "react-icons/pi";
import { LabelGroup } from "../../../api/useGetAdAudio.types";

type Props = {
  data: Array<LabelGroup>;
  onFolderClick: (folder: LabelGroup) => void;
  onFolderSelect: (folderId: number, isSelected: boolean) => void;
  selectedFolders: Array<number>;
  isTrained?: boolean;
  selectedFiles: Record<number, boolean>;
};
export const AdAudioFolders = ({
  data,
  onFolderClick,
  onFolderSelect,
  selectedFolders,
  isTrained,
  selectedFiles,
}: Props) => {
  return (
    <ul className="grid grid-cols-4 gap-7">
      {data?.map((folder) => {
        const folderId = folder.chunks[0]?.id;
        const isSelected = selectedFolders.includes(folderId);

        return (
          <li
            key={folder.label}
            className="relative flex flex-col items-center"
          >
            <div className="relative">
              <div className="absolute top-[-8px] left-[3px] flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={isSelected}
                  onChange={(e) => {
                    onFolderSelect(folderId, e.target.checked);
                  }}
                />
              </div>
              <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {folder.chunks?.length}
              </div>
              <PiFolderOpenFill
                className={`text-8xl ${
                  isTrained &&
                  folder.chunks.some((chunk) => selectedFiles[chunk.id])
                    ? "text-red-500 hover:text-red-600"
                    : "text-indigo-400 hover:text-indigo-500"
                } cursor-pointer`}
                onClick={() => {
                  onFolderClick(folder);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {folder.label}
            </p>
          </li>
        );
      })}
    </ul>
  );
};

export default AdAudioFolders;
