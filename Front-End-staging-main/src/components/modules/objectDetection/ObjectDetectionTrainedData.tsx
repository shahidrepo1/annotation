import {
  OdLabeledImageGroup,
  OdTrainingDataType,
} from "../../../api/useGetOdProcessedImages.types";
import ObjectDetectionFolders from "./ObjectDetectionFolders";

type Props = {
  data: OdTrainingDataType;
  onFolderClick: (folder: OdLabeledImageGroup) => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const ObjectDetectionTrainedData = ({
  data,
  onFolderClick,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const getAllDetectionIds = () =>
    data?.trainedData?.flatMap((folder) =>
      folder?.images?.flatMap((img) =>
        img?.detections?.map((det) => det.detection_id)
      )
    );

  const handleSelectAllToggle = (checked: boolean) => {
    if (checked) {
      setSelectedIds(getAllDetectionIds());
    } else {
      setSelectedIds([]);
    }
  };

  const handleFolderToggle = (
    folder: OdLabeledImageGroup,
    checked: boolean
  ) => {
    const folderDetectionIds = folder.images.flatMap((img) =>
      img.detections.map((det) => det.detection_id)
    );

    setSelectedIds((prev) => {
      if (checked) {
        return [...new Set([...prev, ...folderDetectionIds])];
      } else {
        return prev.filter((id) => !folderDetectionIds.includes(id));
      }
    });
  };

  const allDetectionIds = getAllDetectionIds();

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
                allDetectionIds.length > 0 &&
                selectedIds.length === allDetectionIds.length
              }
              onChange={(e) => {
                handleSelectAllToggle(e.target.checked);
              }}
            />
            <span>Select all</span>
          </div>
        </div>
        <ObjectDetectionFolders
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
    </>
  );
};
