import useTrainedAudioStore from "../../../../hooks/useTrainedAudioStore";
import useUntrainedAudioStore from "../../../../hooks/useUntrainedAudioStore";
import Button from "../../../ui/Button";
type ModalContentButton = {
  audioData: Record<
    string,
    Array<{ id: number; name: string; audioChunk?: string }>
  >;
  selectedFolder: string;
  status: string;
  updateSelectedFolders: (speaker: string, chunkIds: Array<number>) => void;
  onClose: () => void;
  handleFinalSave: () => void;
  setFilesCount: (data: Record<string, string>) => void;
};
export const ModalContentButton = ({
  audioData,
  selectedFolder,
  status,
  updateSelectedFolders,
  onClose,
  handleFinalSave,
  setFilesCount,
}: ModalContentButton) => {
  const { trainedSelectedAudioIds, setRedHighlight } = useTrainedAudioStore();
  const { untrainedSelectedAudioIds } = useUntrainedAudioStore();
  const isTrained = status === "trained";

  const selectedAudioIds = isTrained
    ? trainedSelectedAudioIds
    : untrainedSelectedAudioIds;

  return (
    <>
      <div className="sticky bottom-0 flex justify-center bg-white py-5 border-t z-10">
        <div className="text-center">
          <Button
            className="ml-4 bg-indigo-500 text-white hover:bg-indigo-600"
            onClick={() => {
              const selectedFiles = audioData[selectedFolder]?.filter((file) =>
                selectedAudioIds.includes(file.id)
              );
              // @ts-expect-error : payload has a type mismatch, but it's handled correctly.
              setFilesCount((prevCounts: Record<string, string>) => ({
                ...prevCounts,
                [selectedFolder]: selectedFiles?.length?.toString(),
              }));
              updateSelectedFolders(
                selectedFolder,
                selectedFiles?.map((file) => file.id)
              );
              if (selectedFiles?.length > 0 && status === "trained") {
                setRedHighlight("trained", selectedFolder);
              }
              if (status === "trained" && selectedFiles?.length === 0) {
                useTrainedAudioStore
                  .getState()
                  .removeRedHighlight("trained", selectedFolder);
              }
              onClose();
            }}
          >
            Close
          </Button>

          <Button
            onClick={handleFinalSave}
            className="ml-4 bg-indigo-500 text-white hover:bg-indigo-600"
            disabled={status === "trained"}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  );
};
