import { SentimentDataResponse } from "../../../api/useGetSentiment.types";
import SentimentTrainedData from "./SentimentTrainedData";
import SentimentUntrainedData from "./SentimentUntrainedData";
import useSentimentTrainModel from "../../../api/useSentimentTrainModel";
import { toast } from "react-toastify";
import { queryClient } from "../../../main";

type Props = {
  data: SentimentDataResponse;
  mediaType: "all" | "audio" | "video" | "document";
  trainedSelected: Array<number>;
  setTrainedSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
  untrainedSelected: Array<number>;
  setUntrainedSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const SentimentViewAll = ({
  data,
  mediaType,
  trainedSelected,
  setTrainedSelected,
  untrainedSelected,
  setUntrainedSelected,
}: Props) => {
  const { mutate, isPending } = useSentimentTrainModel();

  const handleStartTraining = () => {
    mutate(
      {
        moduleName: "sentiment",
        forTrain: untrainedSelected,
        forUntrain: trainedSelected,
      },
      {
        onSuccess: () => {
          toast.success("Training started successfully");
          void queryClient.invalidateQueries({
            queryKey: ["allSentiments"],
          });
          void queryClient.invalidateQueries({
            queryKey: ["SentimentTrainModel"],
          });
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to start training");
        },
      }
    );
  };

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <SentimentTrainedData
              data={data}
              mediaType={mediaType}
              selectedChunkIds={trainedSelected}
              setSelectedChunkIds={setTrainedSelected}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1/2">
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <SentimentUntrainedData
              data={data}
              mediaType={mediaType}
              selectedChunkIds={untrainedSelected}
              setSelectedChunkIds={setUntrainedSelected}
            />
          </div>
        </div>
      </div>

      {(trainedSelected.length > 0 || untrainedSelected.length > 0) && (
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          <button
            className={`bg-indigo-600 text-white py-2 px-4 rounded mx-auto text-center ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleStartTraining}
            disabled={isPending}
          >
            {isPending ? "Training..." : "Start Training"}
          </button>
        </div>
      )}
    </>
  );
};

export default SentimentViewAll;
