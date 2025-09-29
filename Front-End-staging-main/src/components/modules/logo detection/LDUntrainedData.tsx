import Datepicker from "react-tailwindcss-datepicker";
import { twMerge } from "tailwind-merge";
import { useSearchParams } from "react-router";
import { useState } from "react";
// import LDUploadMediaModal from "./LDUploadMediaModal";
// import useGetLogoAnnotatedImage from "../../../api/useGetLogoAnnotatedImage";
import { LogoDetectionFolders } from "./LogoDetectionFolders";
import {
  ImageType,
  LogoDetectionDataType,
} from "../../../api/useGetLogoData.types";

type Props = {
  data: LogoDetectionDataType;
  onFolderClick: (folder: { date: string; data: Array<ImageType> }) => void;
  onUploadClick: () => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const LDUntrainedData = ({
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

  const getAllImageIds = () =>
    data.results.untrainedData.flatMap((group) =>
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
  const allImages = data.results.untrainedData;
  return (
    <div className="w-full space-x-3">
      {active === "UntrainedData" && (
        <div className="grid grid-cols-2 space-x-7 ">
          <Datepicker
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
                curr.set("startDate", value.startDate?.toISOString() ?? "");
                curr.set("endDate", value.endDate?.toISOString() ?? "");
                return curr;
              });
            }}
            inputClassName={twMerge(
              "text-gray-700 w-full rounded-md border border-gray-400 overflow-hidden px-2 text-sm focus:outline-none",
              "h-[38px]"
            )}
            readOnly={true}
          />

          <select
            className="px-2 border border-gray-400 rounded-md outline-none text-gray-700 h-[38px] w-full"
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
      )}
      <div className={active === "UntrainedData" ? "mt-4" : ""}>
        <div className="flex items-center justify-between pb-4">
          <h1 className="font-bold text-xl p-3">Untrained Data</h1>
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
      </div>

      <LogoDetectionFolders
        data={allImages}
        onFolderClick={onFolderClick}
        selectedIds={selectedIds}
        onFolderCheckboxToggle={handleFolderToggle}
        isTrained={false}
      />

      {selectedSource === "Upload" && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-indigo-700 text-white py-2 px-4 rounded"
            onClick={onUploadClick}
          >
            Upload Media
          </button>
        </div>
      )}

      {Object.keys(data.results.trainedData).length === 0 && (
        <div className="text-center text-gray-500 mt-4 text-sm italic">
          No data found
        </div>
      )}
    </div>
  );
};
