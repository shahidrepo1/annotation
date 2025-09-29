import ObjectDetectionFolders from "./ObjectDetectionFolders";
import DatePicker from "../../ui/DatePicker";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  OdLabeledImageGroup,
  OdTrainingDataType,
} from "../../../api/useGetOdProcessedImages.types";

type Props = {
  data: OdTrainingDataType;
  onFolderClick: (folder: OdLabeledImageGroup) => void;
  onUploadClick: () => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const ObjectDetectionUntrainedData = ({
  data,
  onFolderClick,
  onUploadClick,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSource, setSelectedSource] = useState("");
  const startDate = searchParams.get("startDate");
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate");
  const endDateDate = endDate ? new Date(endDate) : null;
  const active = searchParams.get("active");

  const getAllDetectionIds = () =>
    data.untrainedData.flatMap((folder) =>
      folder.images.flatMap((img) =>
        img.detections?.map((det) => det.detection_id)
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
      img.detections?.map((det) => det.detection_id)
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
        {active === "UntrainedData" && (
          <>
            <div className="grid grid-cols-2 space-x-7">
              <DatePicker
                value={{ startDate: startDateDate, endDate: endDateDate }}
                onChange={(value) => {
                  if (!value) return;
                  if (!value.startDate && !value.endDate) {
                    setSearchParams((curr) => {
                      curr.delete("startDate");
                      curr.delete("endDate");
                      return curr;
                    });
                    return;
                  }
                  setSearchParams((curr) => {
                    curr.set(
                      "startDate",
                      value.startDate?.toISOString().slice(0, 10) ?? ""
                    );
                    curr.set(
                      "endDate",
                      value.endDate?.toISOString().slice(0, 10) ?? ""
                    );
                    return curr;
                  });
                }}
                readOnly={true}
              />

              <select
                className="px-2 border border-gray-400 rounded-md outline-none text-gray-700 h-[38px]"
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                }}
              >
                <option value="" disabled className="text-gray-400">
                  Source
                </option>
                <option value="Upload">Upload</option>
                <option value="Application">Application</option>
              </select>
            </div>
          </>
        )}

        <div className={active === "UntrainedData" ? "mt-4" : ""}>
          <div className="flex items-center justify-between pb-4">
            <h1 className="font-bold text-xl p-3">Untrained Data</h1>
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
        </div>

        <ObjectDetectionFolders
          data={data.untrainedData}
          onFolderClick={onFolderClick}
          selectedIds={selectedIds}
          onFolderCheckboxToggle={handleFolderToggle}
          isTrained={false}
        />

        {selectedSource === "Upload" && (
          <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-6">
            <button
              className="bg-indigo-700 text-white py-2 px-4 rounded"
              onClick={onUploadClick}
            >
              Upload Media
            </button>
          </div>
        )}
        {data.untrainedData.length === 0 && (
          <div className="text-center text-gray-500 mt-4 text-sm italic">
            No data found
          </div>
        )}
      </div>
    </>
  );
};
