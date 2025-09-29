import { useState } from "react";
import { AllAudioData } from "../../../api/useGetAllAudioChunks.types";
import ModalContent from "./ModalContent";
import Modal from "../../ui/Modal";
import useGetTrainedPersons from "../../../api/useGetTrainedPersons";
import useUpdateSpeaker from "../../../api/useUpdateSpeaker";
import { toast } from "react-toastify";
import useGetAudioChunks from "../../../api/useGetAudioChunks";
import TrainedData from "./TrainedData";
import { UntrainedData } from "./UntrainedData";
import useTrainedAudioStore from "../../../hooks/useTrainedAudioStore";
import useUntrainedAudioStore from "../../../hooks/useUntrainedAudioStore";
import useSrTrainModel from "../../../api/useSrTrainModel";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const ViewAll = ({ data }: { data: AllAudioData }) => {
  const [selectedFolder] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPerson, setNewPerson] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  type OptionType = { value: string; label: string };
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [audioData, setAudioData] = useState<
    Record<string, Array<{ id: number; name: string }>>
  >({});
  const [chunksId] = useState<number>(0);
  const { data: AllData } = useGetTrainedPersons();
  const {
    isError: isErrorUpdating,
    error: errorUpdate,
    mutate: updateSpeaker,
  } = useUpdateSpeaker();
  const [, setOpen] = useState(false);
  const { mutate: getAudioChunks } = useGetAudioChunks();
  const trainModel = useSrTrainModel();
  const {
    trainedSelectedFolders,
    clearSelections: clearTrainedSelections,
    resetHighlight,
  } = useTrainedAudioStore();

  const {
    untrainedSelectedFolders,
    clearSelections: clearUntrainedSelections,
  } = useUntrainedAudioStore();

  const queryClient = useQueryClient();

  type TrainingData = {
    moduleName: string;
    forTrain: Record<string, Array<string>>;
    forUntrain: Record<string, Array<string>>;
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
          onSuccess: ({
            data,
          }: {
            data: Record<string, Array<{ id: number; name: string }>>;
          }) => {
            setAudioData(data);
            setOpen(false);
          },
        });
      },
    });
  }

  const handleStartTraining = () => {
    if (
      Object.keys(trainedSelectedFolders).length === 0 &&
      Object.keys(untrainedSelectedFolders).length === 0
    ) {
      toast.info("Please select at least one folder or one audio to train.");
      return;
    }

    const trainingData: TrainingData = {
      moduleName: "SR",
      forTrain: {},
      forUntrain: {},
    };

    Object.keys(untrainedSelectedFolders).forEach((speaker) => {
      const selectedChunkIds = untrainedSelectedFolders[speaker];
      const allChunks =
        data.noneTrainedData
          .find((f) => f.speaker === speaker)
          ?.chunks.map((chunk) => ({
            id: chunk.id,
            name: chunk.audioChunk || "",
          })) || [];

      trainingData.forTrain[speaker] = allChunks
        .filter((chunk) => selectedChunkIds.includes(chunk.id))
        .map((chunk) => chunk.id.toString()); // send IDs
    });

    Object.keys(trainedSelectedFolders).forEach((speaker) => {
      const selectedChunkIds = trainedSelectedFolders[speaker];
      const allChunks =
        data.trainedData
          .find((f) => f.speaker === speaker)
          ?.chunks.map((chunk) => ({
            id: chunk.id,
            name: chunk.audioChunk || "",
          })) || [];

      trainingData.forUntrain[speaker] = allChunks
        .filter((chunk) => selectedChunkIds.includes(chunk.id))
        .map((chunk) => chunk.id.toString()); // send IDs
    });

    // Fire the training mutation
    trainModel.mutate(trainingData, {
      onSuccess: () => {
        toast.success("Training started successfully!");
        clearTrainedSelections();
        clearUntrainedSelections();
        resetHighlight();
        void queryClient.invalidateQueries({ queryKey: ["allAudioChunks"] });
        void queryClient.invalidateQueries({ queryKey: ["srTrainedData"] });
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const err = error.response?.data as { message?: string };
          toast.error(err?.message || "Failed to Start Training.");
        } else {
          toast.error("Something went wrong.");
        }
      },
    });
  };

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <TrainedData data={data} status="trained" />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <UntrainedData data={data} status="untrained" />
          </div>
        </div>

        {isModalOpen && selectedFolder && (
          <Modal>
            <ModalContent
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
              // @ts-expect-error: data is an array of strings, but the component expects a different type
              data={AllData}
              error={isErrorUpdating ? errorUpdate.message : null}
              status="view all"
              setFilesCount={() => {}}
              updateSelectedFolders={() => {}}
            />
          </Modal>
        )}
      </div>

      <div className="relative">
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          {(Object.values(trainedSelectedFolders).some(
            (folder) => folder?.length > 0
          ) ||
            Object.values(untrainedSelectedFolders).some(
              (folder) => folder?.length > 0
            )) && (
            <button
              className="bg-indigo-600 text-white py-2 px-4 rounded mx-auto text-center"
              onClick={handleStartTraining}
            >
              {trainModel.isPending ? "Training..." : "Start Training"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
