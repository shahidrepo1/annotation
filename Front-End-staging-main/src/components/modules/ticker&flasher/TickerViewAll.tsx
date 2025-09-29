import TickerTrainedData from "./TickerTrainedData";
import TickerUntrainedData from "./TickerUntrainedData";
import {
  TickerDataGroupType,
  TickerTrainingDataType,
} from "../../../api/useGetTfProcessedImages.types";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import useTfTrainModel from "../../../api/useTfTrainModel";
import axios from "axios";

type TickerProps = {
  data: TickerTrainingDataType;
  onFolderClick: (folder: TickerDataGroupType) => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const TickerViewAll = ({
  data,
  onFolderClick,
  selectedIds,
  setSelectedIds,
}: TickerProps) => {
  const trainModel = useTfTrainModel();
  const queryClient = useQueryClient();

  const handleStartTraining = () => {
    const forTrain: Array<number> = [];
    const forUntrain: Array<number> = [];

    data.untrainedData.forEach((folder) => {
      const matched = folder.images
        .filter((img) => selectedIds.includes(img.image_id))
        .map((img) => img.image_id);

      if (matched.length > 0) {
        forTrain.push(...matched);
      }
    });

    data.trainedData.forEach((folder) => {
      const matched = folder.images
        .filter((img) => selectedIds.includes(img.image_id))
        .map((img) => img.image_id);

      if (matched.length > 0) {
        forUntrain.push(...matched);
      }
    });

    const payload = {
      moduleName: "TF",
      forTrain,
      forUntrain,
      reTrain: {},
    };
    // if (forTrain.length === 0) {
    //   toast.warn("Please select images for training.");
    //   return;
    // }

    trainModel.mutate(payload, {
      onSuccess: () => {
        toast.success("Training started successfully!");
        void queryClient.invalidateQueries({
          queryKey: ["TfProccessedImages"],
        });
        void queryClient.invalidateQueries({ queryKey: ["TfTrainedData"] });
        void queryClient.invalidateQueries({ queryKey: ["tfTrainModel"] });
        setSelectedIds([]);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError<Record<string, string>>(error)) {
          const err = error.response?.data;

          toast.warning(err?.error ?? "Training failed. Please try again.");
        }
      },
    });
  };

  return (
    <>
      <div className="w-full max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
              <TickerTrainedData
                data={data}
                onFolderClick={onFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
              <TickerUntrainedData
                data={data}
                onFolderClick={onFolderClick}
                onUploadClick={() => {}}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            </div>
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

export default TickerViewAll;
