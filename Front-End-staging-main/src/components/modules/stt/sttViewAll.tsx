import useSttSelectionStore from "../../../hooks/useSttSelectionStore";
import SttTrainedData from "./SttTrainedData";
import SttUntrainedData from "./SttUntrainedData";
import useSttTrainModel from "../../../api/useSttTrainModel";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useGetSttChunks from "../../../api/useGetSttChunks";

export const SttViewAll = () => {
  const {
    untrainedSelectedFolders,
    trainedSelectedFolders,
    selectedAudioIds,
    clearUntrainedSelections,
    clearTrainedSelections,
  } = useSttSelectionStore();
  const { mutate: trainModel, status } = useSttTrainModel();
  const isLoading = status === "pending";
  const queryClient = useQueryClient();
  const { refetch } = useGetSttChunks();

  const handleStartTraining = () => {
    const allUntrainedIds = Object.values(untrainedSelectedFolders).flatMap(
      (ids) => ids
    );
    const allTrainedIds = Object.values(trainedSelectedFolders).flatMap(
      (ids) => ids
    );

    const untrainedAudioIds = selectedAudioIds.filter((id) =>
      allUntrainedIds.includes(id)
    );
    const trainedAudioIds = selectedAudioIds.filter((id) =>
      allTrainedIds.includes(id)
    );

    const forTrain = Array.from(
      new Set([...allUntrainedIds, ...untrainedAudioIds])
    );
    const forUntrain = Array.from(
      new Set([...allTrainedIds, ...trainedAudioIds])
    );

    const payload = {
      moduleName: "STT",
      forTrain,
      forUntrain,
    };

    trainModel(payload, {
      onSuccess: () => {
        toast.success("Training started successfully!");
        clearTrainedSelections();
        clearUntrainedSelections();

        const handleInvalidations = async () => {
          try {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["sttTrainModel"] }),
              queryClient.invalidateQueries({ queryKey: ["SttChunks"] }),
              queryClient.invalidateQueries({ queryKey: ["sttTrainedData"] }),
              queryClient.invalidateQueries({ queryKey: ["sttUntrainedData"] }),
            ]);
            await refetch();
          } catch (error) {
            console.error("Failed to invalidate queries:", error);
          }
        };
        void handleInvalidations();
      },
      onError: () => {
        toast.error("Failed to Train Model");
      },
    });
  };

  const hasUntrainedSelected =
    Object.values(untrainedSelectedFolders).some(
      (folder) => folder.length > 0
    ) || selectedAudioIds.length > 0;

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <SttTrainedData />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <SttUntrainedData />
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          {hasUntrainedSelected && (
            <button
              className={`bg-indigo-600 text-white py-2 px-4 rounded mx-auto text-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleStartTraining}
              disabled={isLoading}
            >
              {isLoading ? "Training..." : "Start Training"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SttViewAll;
