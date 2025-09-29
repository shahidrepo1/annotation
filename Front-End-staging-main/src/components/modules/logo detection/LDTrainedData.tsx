import { LogoDetectionFolders } from "./LogoDetectionFolders";
import {
  ImageType,
  LogoDetectionDataType,
} from "../../../api/useGetLogoData.types";
// import { groupImagesByDate } from "../../../utils/GroupImagesByDate";
type Props = {
  data: LogoDetectionDataType;
  onFolderClick: (folder: { date: string; data: Array<ImageType> }) => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
  isTrained?: boolean;
};

export const LDTrainedData = ({
  data,
  onFolderClick,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const getAllImageIds = () =>
    data.results.trainedData.flatMap((group) =>
      group.data.flatMap((image) => image.labels.map((label) => label.id))
    );

  const handleSelectAllToggle = (checked: boolean) => {
    if (checked) {
      setSelectedIds(getAllImageIds());
    } else {
      setSelectedIds([]);
    }
  };

  const handleFolderToggle = (
    folderGroup: { date: string; data: Array<ImageType> },
    checked: boolean
  ) => {
    const folderImageIds = folderGroup.data.flatMap((img) =>
      img.labels.map((label) => label.id)
    );

    setSelectedIds((prev) =>
      checked
        ? [...new Set([...prev, ...folderImageIds])]
        : prev.filter((id) => !folderImageIds.includes(id))
    );
  };

  const allFolders = data.results.trainedData;
  return (
    <>
      <div className="w-full space-x-3">
        <div className="flex items-center justify-between pb-4">
          <h1 className="font-bold text-xl p-3">Trained Data</h1>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 text-sm cursor-pointer"
              checked={
                getAllImageIds().length > 0 &&
                selectedIds.length === getAllImageIds().length
              }
              onChange={(e) => {
                handleSelectAllToggle(e.target.checked);
              }}
            />
            <span>Select all</span>
          </div>
        </div>

        <LogoDetectionFolders
          data={allFolders}
          onFolderClick={onFolderClick}
          selectedIds={selectedIds}
          onFolderCheckboxToggle={handleFolderToggle}
          isTrained={true}
        />

        {Object.keys(data.results.trainedData).length === 0 && (
          <div className="text-center text-gray-500 mt-4 text-sm italic">
            No data found
          </div>
        )}
      </div>
    </>
  );
};
