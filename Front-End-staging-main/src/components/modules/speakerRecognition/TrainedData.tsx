/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from "react";
import { AllAudioData } from "../../../api/useGetAllAudioChunks.types";
import { Folders } from "./Folders";
import ModalContent from "./ModalContent";
import Modal from "../../ui/Modal";
import useGetTrainedPersons from "../../../api/useGetTrainedPersons";
import useGetAudioChunks from "../../../api/useGetAudioChunks";
import useUpdateSpeaker from "../../../api/useUpdateSpeaker";
import { toast } from "react-toastify";
import { status } from "./SrTabs";
import { useSearchParams } from "react-router";
import useTrainedAudioStore from "../../../hooks/useTrainedAudioStore";
export const TrainedData = ({
  data,
  status,
  hideHeader,
}: {
  data: AllAudioData;
  status: status;
  hideHeader?: boolean;
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioData, setAudioData] = useState<
    Record<string, Array<{ id: number; name: string }>>
  >({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPerson, setNewPerson] = useState("");
  const { data: trainedPersons } = useGetTrainedPersons();
  const [chunksId] = useState<number>(0);
  const [, setOpen] = useState(false);
  type OptionType = { value: string; label: string };
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const {
    isError: isErrorUpdating,
    error: errorUpdate,
    mutate: updateSpeaker,
  } = useUpdateSpeaker();
  const { mutate: getAudioChunks } = useGetAudioChunks();
  const [filesCount, setFilesCount] = useState<Array<string>>([]);
  const [searchParams] = useSearchParams();
  const active = searchParams.get("active");
  const {
    trainedSelectedFolders,
    trainedSelectedAudios,
    setTrainedSelectedFolders,
    setTrainedSelectedAudios,
    setTrainedSelectedAudioIds,
    clearSelections,
  } = useTrainedAudioStore();

  useEffect(() => {
    setTrainedSelectedAudios(audioData);
  }, [audioData, setTrainedSelectedAudios]);

  const handleFolderClick = (
    speaker: string,
    chunks: Array<{ id: number; name: string }> | undefined
  ) => {
    setSelectedFolder(speaker);
    setAudioData((prev) => ({ ...prev, [speaker]: chunks ?? [] }));
    setIsModalOpen(true);
  };

  function handleSubmit() {
    const data = {
      oldSpeaker: selectedFolder ? selectedFolder : "",
      newSpeaker: isAddingNew ? newPerson || "" : selectedOption?.label || "",
      file: selectedFolder
        ? audioData[selectedFolder].map((item) => item.name)
        : [],
    };

    if (!data.newSpeaker) {
      toast.info("Please select person first");
      return;
    }

    updateSpeaker(data, {
      onSuccess: () => {
        toast.success("Speaker updated successfully!");
        const data = {
          fileId: chunksId,
        };
        getAudioChunks(data, {
          onSuccess: ({ data }) => {
            setAudioData(data.data);
            setOpen(false);
          },
        });
      },
    });
  }

  const handleCheckboxChange = (speaker: string, chunkIds: Array<number>) => {
    setTrainedSelectedFolders({
      ...trainedSelectedFolders,
      [speaker]: chunkIds,
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (audioData[speaker]) {
      setTrainedSelectedAudios({
        ...trainedSelectedAudios,
        [speaker]: audioData[speaker].filter((chunk) =>
          chunkIds.includes(chunk.id)
        ),
      });
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const allSelectedFolders: Record<string, Array<number>> = {};
      const allAudioData: Record<
        string,
        Array<{ id: number; name: string }>
      > = {};
      const allSelectedAudios: Record<
        string,
        Array<{ id: number; name: string }>
      > = {};
      const allAudioIds: Array<number> = [];

      data.trainedData.forEach((folder) => {
        const chunkIds = folder.chunks.map((chunk) => chunk.id);
        const chunkDetails = folder.chunks.map((chunk) => ({
          id: chunk.id,
          name: chunk.audioChunk || "",
        }));

        allSelectedFolders[folder.speaker] = chunkIds;
        allAudioData[folder.speaker] = chunkDetails;
        allSelectedAudios[folder.speaker] = chunkDetails;
        allAudioIds.push(...chunkIds);

        useTrainedAudioStore
          .getState()
          .setRedHighlight("trained", folder.speaker);
      });

      setTrainedSelectedFolders(allSelectedFolders);
      setAudioData(allAudioData);
      setTrainedSelectedAudios(allSelectedAudios);
      setTrainedSelectedAudioIds(allAudioIds);
    } else {
      if (data.trainedData.length === 0) {
        setTrainedSelectedFolders({});
      } else {
        clearSelections();
        setAudioData({});
        data.trainedData.forEach((folder) => {
          useTrainedAudioStore
            .getState()
            .removeRedHighlight("trained", folder.speaker);
        });
      }
    }
  };

  return (
    <div className="w-full space-x-3 ">
      <div className={active === "UntrainedData" ? "mt-4" : ""}>
        {!hideHeader && (
          <div className="flex items-center justify-between pb-4">
            <h1 className="font-bold text-xl p-3">Trained Data</h1>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 text-sm cursor-pointer"
                checked={
                  data.trainedData.length > 0 &&
                  data.trainedData.every(
                    (folder) =>
                      trainedSelectedFolders[folder.speaker]?.length ===
                      folder.chunks.length
                  )
                }
                onChange={(e) => {
                  handleSelectAllChange(e.target.checked);
                }}
              />
              <span>Select all</span>
            </div>
          </div>
        )}
        <Folders
          data={data.trainedData}
          onFolderClick={handleFolderClick}
          filesCount={filesCount}
          selectedFolders={trainedSelectedFolders}
          onCheckboxChange={handleCheckboxChange}
          status="trained"
        />
        {data.trainedData.length === 0 && (
          <div className="text-center text-gray-500 mt-4 text-sm italic">
            No data found
          </div>
        )}
      </div>

      {isModalOpen && selectedFolder && (
        <Modal>
          <ModalContent
            status={status}
            audioData={audioData}
            selectedFolder={selectedFolder}
            setAudioData={setAudioData}
            onClose={() => {
              setIsModalOpen(false);
            }}
            onSubmit={handleSubmit}
            dataId={chunksId}
            isAddingNew={isAddingNew}
            newPerson={newPerson}
            setNewPerson={setNewPerson}
            setIsAddingNew={setIsAddingNew}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            data={trainedPersons?.trainedData?.map((item) => item.speaker)}
            error={isErrorUpdating ? errorUpdate?.message : null}
            // @ts-expect-error: setFilesCount has a type mismatch, but it's handled correctly.
            setFilesCount={setFilesCount}
            updateSelectedFolders={handleCheckboxChange}
          />
        </Modal>
      )}
    </div>
  );
};

export default TrainedData;
