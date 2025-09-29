import Datepicker from "react-tailwindcss-datepicker";
import { useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useState, useEffect, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { SentimentFolders } from "./SentimentFolders";
import { SentimentUploadMediaModal } from "./SentimentUploadMediaModal";
import { SentimentModal } from "./SentimentModal";
import { SentimentData } from "../../../api/useSentimentResponse.types";
import { SentimentAnalysisFolderModal } from "./SentimentFolderModal";
import { SentimentDataResponse } from "../../../api/useGetSentiment.types";

type Props = {
  data: SentimentDataResponse;
  mediaType: "all" | "audio" | "video" | "document";
  selectedChunkIds: Array<number>;
  setSelectedChunkIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const SentimentUntrainedData = ({
  data,
  mediaType,
  selectedChunkIds,
  setSelectedChunkIds,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate") ?? (null as string | null);
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate") ?? (null as string | null);
  const endDateDate = endDate ? new Date(endDate) : null;
  const [selectedSource, setSelectedSource] = useState("");
  const active = searchParams.get("active");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentimentdata, setSentimentData] = useState<SentimentData | null>(
    null
  );
  const [selectedFolder, setSelectedFolder] = useState<
    "positive" | "negative" | "neutral" | null
  >(null);
  const [selectedFolders, setSelectedFolders] = useState<
    Array<"positive" | "negative" | "neutral">
  >([]);
  // const [selectedChunkIds, setSelectedChunkIds] = useState<Array<number>>([]);
  const [selectAll, setSelectAll] = useState(false);

  const allChunkIds = useMemo(() => {
    return [
      ...(data.untrainedData.positive ?? []).map((e) => e.id),
      ...(data.untrainedData.negative ?? []).map((e) => e.id),
      ...(data.untrainedData.neutral ?? []).map((e) => e.id),
    ];
  }, [
    data.untrainedData.positive,
    data.untrainedData.negative,
    data.untrainedData.neutral,
  ]);

  const handleSelectAllToggle = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      setSelectedFolders(["positive", "negative", "neutral"]);
      setSelectedChunkIds(allChunkIds);
    } else {
      setSelectedFolders([]);
      setSelectedChunkIds([]);
    }
  };

  useEffect(() => {
    if (allChunkIds.length === 0) return;
    const allSelected = allChunkIds.every((id) =>
      selectedChunkIds.includes(id)
    );
    setSelectAll(allSelected);
  }, [selectedChunkIds, allChunkIds]);

  const handleFolderClick = (
    folderName: "positive" | "negative" | "neutral"
  ) => {
    setSelectedFolder(folderName);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full space-x-3">
      {active === "UntrainedData" && (
        <div className="grid grid-cols-2 space-x-7">
          <div>
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
              inputClassName={twMerge(
                "text-gray-700 w-full rounded-md border border-gray-400 overflow-hidden px-2 text-sm focus:outline-none",
                "h-[38px]"
              )}
              readOnly={true}
            />
          </div>

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
      )}

      <div className={active === "UntrainedData" ? "mt-4" : ""}>
        <div className="flex items-center justify-between pb-4">
          <h1 className="font-bold text-xl p-3">Untrained Data</h1>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 text-sm cursor-pointer"
              checked={selectAll}
              onChange={handleSelectAllToggle}
            />
            <span className="cursor-pointer text-sm">Select all</span>
          </div>
        </div>
      </div>

      <SentimentFolders
        data={data.untrainedData}
        onFolderClick={handleFolderClick}
        selectedFolders={selectedFolders}
        setSelectedFolders={setSelectedFolders}
        selectedChunkIds={selectedChunkIds}
        setSelectedChunkIds={setSelectedChunkIds}
        mediaType={mediaType}
      />

      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
            <SentimentUploadMediaModal
              setOpen={setIsUploadModalOpen}
              setSentimentData={setSentimentData}
              sentimentData={sentimentdata}
            />
            <button
              className="absolute top-0 right-0 p-5"
              onClick={() => {
                setIsUploadModalOpen(false);
              }}
            >
              <IoClose className="text-2xl" />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && sentimentdata && (
        <SentimentModal data={sentimentdata} setIsModalOpen={setIsModalOpen} />
      )}

      {selectedSource === "Upload" && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-indigo-700 text-white py-2 px-4 rounded"
            onClick={() => {
              setIsUploadModalOpen(true);
            }}
          >
            Upload Media
          </button>
        </div>
      )}

      {isModalOpen && selectedFolder && (
        <SentimentAnalysisFolderModal
          data={{
            [selectedFolder]: data.untrainedData[selectedFolder],
          }}
          setIsModalOpen={setIsModalOpen}
          selectAll={selectAll}
          selectedChunkIds={selectedChunkIds}
          setSelectedChunkIds={setSelectedChunkIds}
          mediaType={mediaType}
        />
      )}
    </div>
  );
};

export default SentimentUntrainedData;
