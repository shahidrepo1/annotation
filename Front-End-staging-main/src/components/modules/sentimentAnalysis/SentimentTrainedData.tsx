import { SentimentFolders } from "./SentimentFolders";
import { useState, useEffect, useMemo } from "react";
import { SentimentAnalysisFolderModal } from "./SentimentFolderModal";
import { SentimentDataResponse } from "../../../api/useGetSentiment.types";

type Props = {
  data: SentimentDataResponse;
  mediaType: "all" | "audio" | "video" | "document";
  selectedChunkIds: Array<number>;
  setSelectedChunkIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const SentimentTrainedData = ({
  data,
  mediaType,
  selectedChunkIds,
  setSelectedChunkIds,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<
    Array<"positive" | "negative" | "neutral">
  >([]);
  const [selectAll, setSelectAll] = useState(false);
  const allChunkIds = useMemo(() => {
    return [
      ...(data.trainedData.positive ?? []).map((e) => e.id),
      ...(data.trainedData.negative ?? []).map((e) => e.id),
      ...(data.trainedData.neutral ?? []).map((e) => e.id),
    ];
  }, [
    data.trainedData.positive,
    data.trainedData.negative,
    data.trainedData.neutral,
  ]);

  const handleFolderClick = (
    folderName: "positive" | "negative" | "neutral"
  ) => {
    setSelectedFolders([folderName]);
    setIsModalOpen(true);
  };

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

  const combinedSelectedData = selectedFolders.reduce(
    (
      acc: Partial<
        Record<
          "positive" | "negative" | "neutral",
          (typeof data.trainedData)["positive"]
        >
      >,
      folder
    ) => {
      acc[folder] = data.trainedData[folder];
      return acc;
    },
    {}
  );

  return (
    <div className="w-full space-x-3">
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-bold text-xl p-3">Trained Data</h1>
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

      <SentimentFolders
        data={data.trainedData}
        onFolderClick={handleFolderClick}
        selectedFolders={selectedFolders}
        setSelectedFolders={setSelectedFolders}
        selectedChunkIds={selectedChunkIds}
        setSelectedChunkIds={setSelectedChunkIds}
        mediaType={mediaType}
        isTrained
      />

      {isModalOpen && selectedFolders.length > 0 && (
        <SentimentAnalysisFolderModal
          data={combinedSelectedData}
          setIsModalOpen={setIsModalOpen}
          selectAll={selectAll}
          selectedChunkIds={selectedChunkIds}
          setSelectedChunkIds={setSelectedChunkIds}
          mediaType={mediaType}
          isTrained
        />
      )}
    </div>
  );
};

export default SentimentTrainedData;
