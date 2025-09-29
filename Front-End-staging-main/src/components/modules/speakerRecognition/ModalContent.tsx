/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import useDeleteAudioChunk from "../../../api/useDeleteAudioChunk";
import { toast } from "react-toastify";
import useAddPerson from "../../../api/useAddPerson";
import { useState } from "react";
import useUpdateSpeaker from "../../../api/useUpdateSpeaker";
import { useQueryClient } from "@tanstack/react-query";
import { status } from "./SrTabs";
import useTrainedAudioStore from "../../../hooks/useTrainedAudioStore";
import useUntrainedAudioStore from "../../../hooks/useUntrainedAudioStore";
import ModalContentHeader from "./modalContentComponent/ModalContentHeader";
import { ModalContentAudio } from "./modalContentComponent/ModalContentAudio";
import { ModalContentButton } from "./modalContentComponent/ModalContentButton";
import axios from "axios";

type AudioData = {
  id: number;
  name: string;
  audioChunk?: string;
};
type OptionType = { value: string; label: string };

type GroupedFile = {
  oldSpeaker: string;
  newSpeaker: string;
  files: Array<string>;
};
type ModalContentProps = {
  audioData: Record<
    string,
    Array<{ id: number; name: string; audioChunk?: string }>
  >;
  selectedFolder: string;
  isAddingNew: boolean;
  newPerson: string;
  setNewPerson: (value: string) => void;
  setIsAddingNew: (value: boolean) => void;
  selectedOption: OptionType | null;
  setSelectedOption: (option: OptionType | null) => void;
  data?: Array<string> | undefined;
  onClose: () => void;
  onSubmit: () => void;
  error: string | null;
  setAudioData: (data: Record<string, [{ id: number; name: string }]>) => void;
  dataId: number;
  status: status;
  setFilesCount: (data: Record<string, string>) => void;
  updateSelectedFolders: (speaker: string, chunkIds: Array<number>) => void;
};

export default function ModalContent({
  audioData,
  selectedFolder,
  isAddingNew,
  newPerson,
  setNewPerson,
  setIsAddingNew,
  selectedOption,
  setSelectedOption,
  data,
  onClose,
  error,
  setAudioData,
  status,
  setFilesCount,
  dataId,
  updateSelectedFolders,
}: ModalContentProps) {
  const { mutate: deleteAudio } = useDeleteAudioChunk();
  const { mutate: addPerson } = useAddPerson();
  const { mutate: updateSpeaker } = useUpdateSpeaker();
  const { trainedSelectedAudioIds, setTrainedSelectedAudioIds } =
    useTrainedAudioStore();
  const { untrainedSelectedAudioIds, setUntrainedSelectedAudioIds } =
    useUntrainedAudioStore();
  const [audioSpeakers, setAudioSpeakers] = useState<Record<number, string>>(
    {}
  );
  const [activeChunkId, setActiveChunkId] = useState<number | null>(null);
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const groupedFiles: Record<string, GroupedFile> = {};
  const querClient = useQueryClient();

  const isTrained = status === "trained";
  const selectedAudioIds = isTrained
    ? trainedSelectedAudioIds
    : untrainedSelectedAudioIds;

  const setselectedAudioIds = isTrained
    ? setTrainedSelectedAudioIds
    : setUntrainedSelectedAudioIds;

  selectedAudioIds.forEach((id) => {
    const oldSpeaker = selectedFolder;
    const newSpeaker = audioSpeakers[id];
    const file =
      (audioData[selectedFolder]?.find((audio) => audio.id === id) as AudioData)
        ?.audioChunk ||
      audioData[selectedFolder]?.find((audio) => audio.id === id)?.name;

    if (file) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!groupedFiles[newSpeaker]) {
        groupedFiles[newSpeaker] = { oldSpeaker, newSpeaker, files: [] };
      }
      groupedFiles[newSpeaker].files.push(file);
    }
  });

  const payload = {
    jobId: dataId,
    speakers: Object.values(groupedFiles),
  };

  const handleFinalSave = () => {
    // @ts-expect-error: payload has a type mismatch, but it's handled correctly.
    updateSpeaker(payload, {
      onSuccess: ({ data }) => {
        toast.success("Speaker updated successfully.");
        setAudioSpeakers((prev) => {
          const updatedSpeakers = { ...prev };
          selectedAudioIds.forEach((id) => {
            updatedSpeakers[id] = selectedOption?.value ?? "";
          });
          return updatedSpeakers;
        });
        setselectedAudioIds([]);
        setShowSaveCancel(false);
        setAudioData(data.data);

        void querClient.invalidateQueries({ queryKey: ["allAudioChunks"] });
        onClose();
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const err = error.response?.data as { error?: string };
          toast.error(err?.error || "Unable to Update Speaker.");
        } else {
          toast.error("Something went wrong.");
        }
      },
    });
  };

  return (
    <div className="py-4 space-y-4 bg-white min-w-[900px] max-h-[90vh] overflow-y-auto px-3 rounded-lg">
      <ModalContentHeader
        isAddingNew={isAddingNew}
        newPerson={newPerson}
        setNewPerson={setNewPerson}
        addPerson={addPerson}
        data={data}
        showSaveCancel={showSaveCancel}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        status={status}
        setIsAddingNew={setIsAddingNew}
        setShowSaveCancel={setShowSaveCancel}
        selectedAudioIds={selectedAudioIds}
        audioSpeakers={audioSpeakers}
        setAudioSpeakers={setAudioSpeakers}
        activeChunkId={activeChunkId}
        setActiveChunkId={setActiveChunkId}
      />

      <ModalContentAudio
        audioData={audioData}
        selectedFolder={selectedFolder}
        status={status}
        audioSpeakers={audioSpeakers}
        setAudioData={setAudioData}
        deleteAudio={deleteAudio}
        setActiveChunkId={setActiveChunkId}
      />

      <ModalContentButton
        audioData={audioData}
        selectedFolder={selectedFolder}
        status={status}
        updateSelectedFolders={updateSelectedFolders}
        onClose={onClose}
        handleFinalSave={handleFinalSave}
        setFilesCount={setFilesCount}
      />

      {error && <p className="text-center text-red-500">{error}</p>}
    </div>
  );
}
