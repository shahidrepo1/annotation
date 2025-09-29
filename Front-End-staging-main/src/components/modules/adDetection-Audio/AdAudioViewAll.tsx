import AdAudioTrainedData from "./AdAudioTrainedData";
import AdAudioUntrainedData from "./AdAudioUntrainedData";
import { DataType } from "../../../api/useGetAdAudio.types";
import { useState } from "react";
import useAdTrainAudio from "../../../api/useAdTrainAudio";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const AdAudioViewAll = ({ data }: { data: DataType }) => {
  const [trainedSelections, setTrainedSelections] = useState<{
    files: Record<number, boolean>;
    folders: Array<number>;
  }>({ files: {}, folders: [] });

  const [untrainedSelections, setUntrainedSelections] = useState({
    files: {} as Record<number, boolean>,
    folders: [] as Array<number>,
  });

  const trainModel = useAdTrainAudio();
  const queryClient = useQueryClient();

  const handleStartTraining = () => {
    const forTrain: Record<string, Array<number>> = {};
    const forUntrain: Record<string, Array<number>> = {};

    data.untrainedData.forEach((folder) => {
      const selectedChunkIds = folder.chunks
        .filter((chunk) => untrainedSelections.files[chunk.id])
        .map((chunk) => chunk.id);

      if (selectedChunkIds.length > 0) {
        forTrain[folder.label] = selectedChunkIds;
      }
    });

    data.trainedData.forEach((folder) => {
      const selectedChunkIds = folder.chunks
        .filter((chunk) => trainedSelections.files[chunk.id])
        .map((chunk) => chunk.id);

      if (selectedChunkIds.length > 0) {
        forUntrain[folder.label] = selectedChunkIds;
      }
    });

    const payload = {
      moduleName: "AD",
      forTrain,
      forUntrain,
      reTrain: {},
    };

    // if (Object.keys(forTrain).length === 0) {
    //   toast.error("Please select at least one file for training");
    //   return;
    // }

    trainModel.mutate(payload, {
      onSuccess: () => {
        toast.success("Training started successfully");
        void queryClient.invalidateQueries({ queryKey: ["AudioSegments"] });
        void queryClient.invalidateQueries({ queryKey: ["AdSegments"] });
        void queryClient.invalidateQueries({ queryKey: ["adTrainAudio"] });
        void queryClient.invalidateQueries({ queryKey: ["AdTrainedData"] });
        setTrainedSelections({ files: {}, folders: [] });
        setUntrainedSelections({ files: {}, folders: [] });
      },
      onError: (error) => {
        toast.error("Failed to start training");
        console.error("Training error:", error);
      },
    });
  };
  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <AdAudioTrainedData
              data={data}
              onSelectionChange={(selections) => {
                setTrainedSelections(selections);
              }}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <AdAudioUntrainedData
              data={data}
              onSelectionChange={(selections) => {
                setUntrainedSelections(selections);
              }}
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded mx-auto text-center"
            onClick={handleStartTraining}
            disabled={trainModel.isPending}
          >
            {trainModel.isPending ? "Training..." : "Start Training"}
          </button>
        </div>
      </div>
    </>
  );
};
