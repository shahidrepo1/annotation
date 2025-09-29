import { PiFolderOpenFill } from "react-icons/pi";
import { FrFolderType } from "../../../api/useFrLabelChunks.types";
type FrFolderProps = {
  data: Array<FrFolderType>;
  onFolderClick: (folder: FrFolderType) => void;
  onFolderSelect: (folder: FrFolderType, isSelected: boolean) => void;
  selectedFolders: Record<string, boolean>;
  setSelectedFolders: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  isTrained: boolean;
  checkedImages: Record<string, boolean>;
};
export const FrFolders = ({
  data,
  onFolderClick,
  onFolderSelect,
  selectedFolders,
  setSelectedFolders,
  isTrained,
  checkedImages,
}: FrFolderProps) => {
  // const [selectedFolders, setSelectedFolders] = useState<
  //   Record<string, boolean>
  // >({});

  const handleFolderCheckboxChange = (
    folder: FrFolderType,
    isChecked: boolean
  ) => {
    setSelectedFolders((prev) => ({
      ...prev,
      [folder.label]: isChecked,
    }));
    onFolderSelect(folder, isChecked);
  };

  return (
    <ul className="grid grid-cols-4 gap-7">
      {data.map((folder) => (
        <li key={folder.label} className="relative flex flex-col items-center">
          <div className="relative">
            <div className="absolute top-[-8px] left-[3px] flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 cursor-pointer"
                checked={!!selectedFolders[folder.label]}
                onChange={(e) => {
                  handleFolderCheckboxChange(folder, e.target.checked);
                }}
              />
            </div>
            <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
              {folder.images.length}
            </div>
            <PiFolderOpenFill
              className={`text-8xl ${
                isTrained &&
                folder.images.some((img) => checkedImages[img.processedImage])
                  ? "text-red-500 hover:text-red-600"
                  : "text-indigo-400"
              } hover:text-indigo-500 cursor-pointer`}
              onClick={() => {
                onFolderClick(folder);
              }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            {folder.label}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default FrFolders;
