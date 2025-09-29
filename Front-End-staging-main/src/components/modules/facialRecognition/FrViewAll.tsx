import FrTrainedData from "./FrTrainedData";
import FrUntrainedData from "./FrUntrainedData";
import { FrProcessedDataType } from "../../../api/useFrLabelChunks.types";
import useFrTrainData from "../../../api/useFrTrainData";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useFrCheckedImages } from "../../../hooks/useFrCheckedImages";

export const FrViewAll = ({ data }: { data: FrProcessedDataType }) => {
  const trainModel = useFrTrainData();
  const queryClient = useQueryClient();
  const { checkedImages, resetCheckedImages } = useFrCheckedImages();

  const handleStartTraining = () => {
    const hasCheckedImages = Object.values(checkedImages).some(
      (isChecked) => isChecked
    );

    if (!hasCheckedImages) {
      toast.info("Please select at least one image to train.");
      return;
    }

    const forTrain: Record<string, Array<number>> = {};
    const forUntrain: Record<string, Array<number>> = {};

    Object.entries(checkedImages).forEach(([imageId, isChecked]) => {
      if (isChecked) {
        const folder = data.untrainedData.find((folder) =>
          folder.images.some((img) => img.processedImage === imageId)
        );

        const matchingImage = folder?.images.find(
          (img) => img.processedImage === imageId
        );

        if (folder && matchingImage) {
          (forTrain[folder.label] ??= []).push(matchingImage.id);
        }
      }
    });

    Object.entries(checkedImages).forEach(([imageId, isChecked]) => {
      if (isChecked) {
        const folder = data.trainedData.find((folder) =>
          folder.images.some((img) => img.processedImage === imageId)
        );

        const matchingImage = folder?.images.find(
          (img) => img.processedImage === imageId
        );

        if (folder && matchingImage) {
          (forUntrain[folder.label] ??= []).push(matchingImage.id);
        }
      }
    });

    const apiData = {
      moduleName: "FR",
      forTrain,
      forUntrain,
      reTrain: {},
    };

    trainModel.mutate(apiData, {
      onSuccess: () => {
        toast.success("Training started successfully!");
        resetCheckedImages();
        void queryClient.invalidateQueries({ queryKey: ["ProccessedImages"] });
        void queryClient.invalidateQueries({ queryKey: ["FrTrainedData"] });
        void queryClient.invalidateQueries({ queryKey: ["frTrainModel"] });
        void queryClient.invalidateQueries({ queryKey: ["FrChunks"] });
        void queryClient.invalidateQueries({ queryKey: ["FrLabel"] });
      },
      onError: () => {
        toast.error("Failed to start training.");
      },
    });
  };

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <FrTrainedData data={data} />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <FrUntrainedData data={data} />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded mx-auto text-center"
            onClick={handleStartTraining}
          >
            {trainModel.isPending ? "Training..." : "Start Training"}
          </button>
        </div>
      </div>
    </>
  );
};

export default FrViewAll;
