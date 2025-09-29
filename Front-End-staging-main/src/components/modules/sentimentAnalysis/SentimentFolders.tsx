import { PiFolderOpenFill } from "react-icons/pi";
import { SentimentGroup } from "../../../api/useGetSentiment.types";

type Props = {
  data: SentimentGroup;
  mediaType: "all" | "audio" | "video" | "document";
  onFolderClick: (folderName: "positive" | "negative" | "neutral") => void;
  selectedFolders?: Array<"positive" | "negative" | "neutral">;
  setSelectedFolders?: React.Dispatch<
    React.SetStateAction<Array<"positive" | "negative" | "neutral">>
  >;
  selectedChunkIds?: Array<number>;
  setSelectedChunkIds?: React.Dispatch<React.SetStateAction<Array<number>>>;
  isTrained?: boolean;
};

const sentimentLabels = ["positive", "negative", "neutral"] as const;

export const SentimentFolders = ({
  data,
  mediaType,
  onFolderClick,
  setSelectedFolders,
  selectedChunkIds = [],
  setSelectedChunkIds,
  isTrained,
}: Props) => {
  const sentimentFolders = sentimentLabels.map((label) => {
    const filteredEntries = (data[label] || []).filter((entry) => {
      if (mediaType === "all") return true;
      const source =
        entry.media_file.media_type === "text"
          ? "document"
          : entry.media_file.media_type;
      return source === mediaType;
    });

    return {
      label,
      count: filteredEntries.length,
      entries: filteredEntries,
    };
  });

  const handleFolderCheck = (label: "positive" | "negative" | "neutral") => {
    if (!setSelectedFolders || !setSelectedChunkIds) return;

    const chunkIds =
      sentimentFolders
        .find((f) => f.label === label)
        ?.entries.map((e) => e.id) || [];

    const allSelected = chunkIds.every((id) => selectedChunkIds.includes(id));

    if (allSelected) {
      setSelectedChunkIds((prev) =>
        prev.filter((id) => !chunkIds.includes(id))
      );
      setSelectedFolders((prev) => prev.filter((f) => f !== label));
    } else {
      setSelectedChunkIds((prev) =>
        Array.from(new Set([...prev, ...chunkIds]))
      );
      setSelectedFolders((prev) =>
        prev.includes(label) ? prev : [...prev, label]
      );
    }
  };

  return (
    <ul className="grid grid-cols-4 gap-7">
      {sentimentFolders.map((folder) => (
        <li
          key={folder.label}
          className="relative flex flex-col items-center"
          onClick={() => {
            onFolderClick(folder.label);
          }}
        >
          <div className="relative">
            <div className="absolute top-[-8px] left-[3px] flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                checked={
                  selectedChunkIds &&
                  data[folder.label]?.every((entry) =>
                    selectedChunkIds.includes(entry.id)
                  )
                }
                onChange={() => {
                  handleFolderCheck(folder.label);
                }}
              />
            </div>
            <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
              {folder.count}
            </div>
            <PiFolderOpenFill
              className={`text-8xl cursor-pointer 
    ${
      isTrained && folder.entries.some((e) => selectedChunkIds.includes(e.id))
        ? "text-red-500"
        : "text-indigo-400 hover:text-indigo-500"
    }`}
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-600 capitalize">
            {folder.label}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default SentimentFolders;
