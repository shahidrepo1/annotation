import {
  TickerDataGroupType,
  TickerTrainingDataType,
} from "../../../api/useGetTfProcessedImages.types";
import { TickerFolders } from "./TickerFolders";

type TickerProps = {
  data: TickerTrainingDataType;
  onFolderClick: (folder: TickerDataGroupType) => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
  isTrained?: boolean;
};

export const TickerTrainedData = ({
  data,
  onFolderClick,
  selectedIds,
  setSelectedIds,
}: TickerProps) => {
  const getAllImageIds = () =>
    data.trainedData.flatMap((folder) =>
      folder.images.map((img) => img.image_id)
    );

  const handleSelectAllToggle = (checked: boolean) => {
    if (checked) {
      setSelectedIds(getAllImageIds());
    } else {
      setSelectedIds([]);
    }
  };

  const handleFolderToggle = (
    folder: TickerDataGroupType,
    checked: boolean
  ) => {
    const folderImageIds = folder.images.map((img) => img.image_id);

    setSelectedIds((prev) => {
      if (checked) {
        return [...new Set([...prev, ...folderImageIds])];
      } else {
        return prev.filter((id) => !folderImageIds.includes(id));
      }
    });
  };

  return (
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

      <TickerFolders
        data={data.trainedData}
        onFolderClick={onFolderClick}
        selectedIds={selectedIds}
        onFolderCheckboxToggle={handleFolderToggle}
        isTrained={true}
      />

      {data.trainedData.length === 0 && (
        <div className="text-center text-gray-500 mt-4 text-sm italic">
          No data found
        </div>
      )}
    </div>
  );
};
export default TickerTrainedData;
