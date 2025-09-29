import { MdDelete } from "react-icons/md";
import useUntrainedAudioStore from "../../../../hooks/useUntrainedAudioStore";
import useTrainedAudioStore from "../../../../hooks/useTrainedAudioStore";
import { toast } from "react-toastify";
import { backendServiceUrl } from "../../../../api/apiConstants";
import axios from "axios";

type PrevData = Record<string, Array<AudioChunk>>;

type AudioChunkDeleteParams = {
  id: number;
  audioChunkName: string;
};
type AudioChunk = {
  id: number;
};
type ModalContentAudioProps = {
  audioData: Record<
    string,
    Array<{ id: number; name: string; audioChunk?: string }>
  >;
  selectedFolder: string;
  status: string;
  audioSpeakers: Record<number, string>;
  setAudioData: (data: Record<string, [{ id: number; name: string }]>) => void;
  deleteAudio: (
    data: { id: number; speaker: string; audioChunkName: string },
    options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
  ) => void;
  setActiveChunkId: (id: number | null) => void;
};
export const ModalContentAudio = ({
  audioData,
  selectedFolder,
  status,
  audioSpeakers,
  setAudioData,
  deleteAudio,
  setActiveChunkId,
}: ModalContentAudioProps) => {
  const { untrainedSelectedAudioIds } = useUntrainedAudioStore();
  const { trainedSelectedAudioIds } = useTrainedAudioStore();
  const isTrained = status === "trained";
  const selectedAudioIds = isTrained
    ? trainedSelectedAudioIds
    : untrainedSelectedAudioIds;

  const handleAudioSelect = (id: number) => {
    const isTrained = status === "trained";
    const setselectedAudioIds = isTrained
      ? useTrainedAudioStore.getState().setTrainedSelectedAudioIds
      : useUntrainedAudioStore.getState().setUntrainedSelectedAudioIds;

    setselectedAudioIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((audioId) => audioId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteAudioChunk = ({
    id,
    audioChunkName,
  }: AudioChunkDeleteParams) => {
    if (!selectedFolder) {
      toast.error("Speaker information is missing.");
      return;
    }

    if (!audioChunkName) {
      toast.error("Audio chunk name is missing.");
      return;
    }

    const chunkToDelete =
      audioData[selectedFolder].find((chunk) => chunk.id === id) ?? null;

    if (!chunkToDelete) return;

    // @ts-expect-error: prevData has a type mismatch, but it's handled correctly.
    setAudioData((prevData: PrevData) => {
      const folderAudios = prevData[selectedFolder];
      const updatedFolderAudios = folderAudios.filter(
        (chunk: AudioChunk) => chunk.id !== id
      );

      const updatedData =
        updatedFolderAudios.length > 0
          ? { ...prevData, [selectedFolder]: updatedFolderAudios }
          : Object.fromEntries(
              Object.entries(prevData).filter(([key]) => key !== selectedFolder)
            );

      return updatedData;
    });

    let undo = false;

    toast(
      ({ closeToast }) => (
        <div className=" text-black p-2 rounded">
          <span className="font-bold text-xl">Audio chunk deleted!</span>{" "}
          <br></br>
          <span>Do you want to undo it?</span>
          <button
            className="ml-1 text-indigo-500 font-semibold"
            onClick={() => {
              undo = true;
              // @ts-expect-error: prevData has a type mismatch, but it's handled correctly.
              setAudioData((prevData: PrevData) => {
                const folderAudios = prevData[selectedFolder] ?? [];
                const updatedFolderAudios = [chunkToDelete, ...folderAudios];

                return {
                  ...prevData,
                  [selectedFolder]: updatedFolderAudios,
                };
              });
              closeToast();
            }}
          >
            Undo
          </button>
        </div>
      ),
      {
        autoClose: 7000,
      }
    );

    setTimeout(() => {
      if (!undo) {
        const requestData = {
          id,
          speaker: selectedFolder,
          audioChunkName,
        };

        deleteAudio(requestData, {
          onSuccess: () => {
            toast.success("Chunk Deleted Sucessfully");
          },
          onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
              const err = error.response?.data as { message?: string };
              toast.error(err?.message || "Unable to delete the Chunk.");
            } else {
              toast.error("Something went wrong.");
            }
          },
        });
      }
    }, 7000);
  };

  return (
    <>
      <ul className="space-y-2">
        {audioData[selectedFolder]?.map((audio) => (
          <li
            key={audio.id}
            className="border p-2 rounded-lg flex items-center gap-2"
          >
            <input
              type="checkbox"
              checked={selectedAudioIds.includes(audio.id)}
              onChange={() => {
                handleAudioSelect(audio.id);
              }}
              onClick={() => {
                setActiveChunkId(audio.id);
              }}
              className="cursor-pointer"
            />

            <audio
              controls
              className="w-full"
              src={`${backendServiceUrl}media/Speakers/${selectedFolder}/${
                audio.audioChunk || audio.name
              }`}
            >
              Your browser does not support the audio element.
            </audio>

            {status !== "trained" ? (
              <button
                className="p-2 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                aria-label="Delete audio"
                onClick={() => {
                  handleDeleteAudioChunk({
                    id: audio.id,
                    audioChunkName: audio.name || "",
                  });
                }}
              >
                <MdDelete className="text-3xl" />
              </button>
            ) : selectedAudioIds.includes(audio.id) ? (
              <button
                className=" text-white rounded-md bg-red-500"
                aria-label="Untrain Data"
              >
                Untrain Data
              </button>
            ) : null}

            {audioSpeakers[audio.id] && (
              <span className="px-2 py-1 text-white bg-indigo-500 rounded-lg text-sm font-semibold flex items-center justify-center min-w-[80px]">
                {audioSpeakers[audio.id]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};
