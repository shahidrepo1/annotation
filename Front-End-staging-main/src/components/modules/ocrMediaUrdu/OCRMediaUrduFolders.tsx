import { PiFolderOpenFill } from "react-icons/pi";
import { TrainingDataResponse } from "../../../api/useGetOCRUrduMediByDate.types";
import { useSearchParams } from "react-router-dom";

type Props = {
  data: TrainingDataResponse | null;
  loading?: boolean;
  onFolderClick: (type: string, date: string) => void;
  selectedFolders: Set<string>;
  onFolderSelect: (type: string, date: string, isSelected: boolean) => void;
};

export const OCRMediaFolders = ({
  data,
  loading,
  onFolderClick,
  selectedFolders,
  onFolderSelect,
}: Props) => {
  const [, setSearchParams] = useSearchParams();

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full py-10">
        <CircularLoader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 w-full py-10">
        No data available
      </div>
    );
  }

  const trained = data.trained?.results ?? [];
  const untrained = data.untrained?.results ?? [];

  const allFolders = [
    ...trained.map((f) => ({ ...f, type: "trained" })),
    ...untrained.map((f) => ({ ...f, type: "untrained" })),
  ];

  const handleFolderCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
    date: string
  ) => {
    e.stopPropagation();
    onFolderSelect(type, date, e.target.checked);
  };

  return (
    <ul className="grid grid-cols-4 gap-7">
      {allFolders.map((folder) => {
        const folderKey = `${folder.type}-${folder.date}`;
        const isSelected = selectedFolders?.has(folderKey);
        const isTrained = folder.type === "trained";

        return (
          <li
            key={folderKey}
            className="relative flex flex-col items-center cursor-pointer"
            onClick={() => {
              setSearchParams((params) => {
                params.set("type", folder.type);
                params.set("date", folder.date);
                return params;
              });
              onFolderClick(folder.type, folder.date);
            }}
          >
            <div className="relative">
              <div className="absolute top-[-8px] left-[3px] flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={isSelected}
                  onChange={(e) => {
                    handleFolderCheckboxChange(e, folder.type, folder.date);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </div>

              <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {folder.count}
              </div>

              <PiFolderOpenFill
                className={`text-8xl ${
                  isTrained && isSelected
                    ? "text-red-500"
                    : "text-indigo-400 hover:text-indigo-500"
                }`}
              />
            </div>

            <p className="mt-2 text-center text-sm text-gray-600">
              {folder.date}
            </p>
          </li>
        );
      })}
    </ul>
  );
};

function CircularLoader() {
  return (
    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto" />
  );
}

export default CircularLoader;
