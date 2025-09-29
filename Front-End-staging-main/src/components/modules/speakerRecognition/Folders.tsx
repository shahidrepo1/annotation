import { PiFolderOpenFill } from "react-icons/pi";
import { SpeakerData } from "../../../api/useGetAllAudioChunks.types";
import useTrainedAudioStore from "../../../hooks/useTrainedAudioStore";
import useUntrainedAudioStore from "../../../hooks/useUntrainedAudioStore";

type FoldersProps = {
  data: SpeakerData;
  onFolderClick: (
    speaker: string,
    chunks: Array<{ id: number; name: string }> | undefined
  ) => void;
  filesCount: Array<string>;
  selectedFolders: Record<string, Array<number> | undefined>;

  onCheckboxChange: (speaker: string, chunkIds: Array<number>) => void;
  status: "trained" | "untrained";
};

export const Folders = ({
  data,
  onFolderClick,
  selectedFolders,
  onCheckboxChange,
  status,
}: FoldersProps) => {
  const {
    redHighlightFolders,
    setRedHighlight,
    removeRedHighlight,
    setTrainedSelectedAudioIds,
  } = useTrainedAudioStore();

  const { setUntrainedSelectedAudioIds } = useUntrainedAudioStore();

  const handleFolderCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: SpeakerData[number]
  ) => {
    const chunkIds = item.chunks.map((chunk) => chunk.id);
    const checked = e.target.checked;

    // Update folder selection state
    onCheckboxChange(item.speaker, checked ? chunkIds : []);

    // Update individual file selection state based on status
    if (status === "trained") {
      setTrainedSelectedAudioIds((prevIds) =>
        checked
          ? [...new Set([...prevIds, ...chunkIds])] // Ensure no duplicates
          : prevIds.filter((id) => !chunkIds.includes(id))
      );
    } else {
      setUntrainedSelectedAudioIds((prevIds) =>
        checked
          ? [...new Set([...prevIds, ...chunkIds])] // Ensure no duplicates
          : prevIds.filter((id) => !chunkIds.includes(id))
      );
    }

    // Update highlight state for trained data
    if (status === "trained") {
      if (checked) {
        setRedHighlight(status, item.speaker);
      } else {
        removeRedHighlight(status, item.speaker);
      }
    }
  };

  return (
    <ul className="grid grid-cols-4 gap-7">
      {data?.map((item) => {
        const isChecked =
          selectedFolders[item.speaker]?.length === item.chunks?.length;

        const isHighlighted = redHighlightFolders[status].includes(
          item.speaker
        );

        return (
          <li
            key={item.speaker}
            className="relative flex flex-col items-center"
          >
            <div className="relative">
              <div className="absolute top-[-8px] left-[3px] flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={isChecked}
                  onChange={(e) => {
                    handleFolderCheckboxChange(e, item);
                  }}
                />
              </div>

              <div className="absolute top-[-8px] right-[-8px] text-xs w-5 h-5 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {item.chunks.length}
              </div>

              <div className="p-1 rounded-lg">
                <PiFolderOpenFill
                  className={`text-8xl cursor-pointer ${
                    isHighlighted
                      ? "text-red-500 hover:text-red-600"
                      : "text-indigo-400 hover:text-indigo-500"
                  }`}
                  onClick={() => {
                    const transformedChunks = item.chunks.map((chunk) => ({
                      id: chunk.id,
                      name: chunk.audioChunk,
                    }));

                    onFolderClick(item.speaker, transformedChunks);
                  }}
                />
              </div>
            </div>

            <p className="text-center mt-2">{item.speaker}</p>
          </li>
        );
      })}
    </ul>
  );
};
