import { toast } from "react-toastify";
import {
  OdLabeledImageGroup,
  OdTrainingDataType,
} from "../../../api/useGetOdProcessedImages.types";
import { ObjectDetectionTrainedData } from "./ObjectDetectionTrainedData";
import { ObjectDetectionUntrainedData } from "./ObjectDetectionUntrainedData";
import useOdTrainModel from "../../../api/useOdTrainModel";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Props = {
  data: OdTrainingDataType;
  onFolderClick: (folder: OdLabeledImageGroup) => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};
export const ObjectDetectionViewAll = ({
  data,
  onFolderClick,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const trainModel = useOdTrainModel();
  const queryClient = useQueryClient();
  const handleStartTraining = () => {
    const forTrain: Array<number> = [];
    const forUntrain: Array<number> = [];

    data.untrainedData.forEach((folder) => {
      folder.images.forEach((img) => {
        const detectionIds = img.detections.map((d) => d.detection_id);
        const selectedDetectionIds = detectionIds.filter((id) =>
          selectedIds.includes(id)
        );
        forTrain.push(...selectedDetectionIds);
      });
    });

    data.trainedData.forEach((folder) => {
      folder.images.forEach((img) => {
        const detectionIds = img.detections.map((d) => d.detection_id);
        const selectedDetectionIds = detectionIds.filter((id) =>
          selectedIds.includes(id)
        );
        forUntrain.push(...selectedDetectionIds);
      });
    });

    const payload = {
      moduleName: "OD",
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
        void queryClient.invalidateQueries({ queryKey: ["ProccessedImages"] });
        void queryClient.invalidateQueries({ queryKey: ["OdTrainedData"] });
        void queryClient.invalidateQueries({ queryKey: ["OdTrainModel"] });
        setSelectedIds([]);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError<Record<string, string>>(error)) {
          const err = error.response?.data;
          toast.error(err?.error ?? "Training failed. Please try again.");
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
              <ObjectDetectionTrainedData
                data={data}
                onFolderClick={onFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
              <ObjectDetectionUntrainedData
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
