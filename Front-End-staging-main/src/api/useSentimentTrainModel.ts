import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { sentimentTrainModel } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Array<number>;
  forUntrain: Array<number>;
};
export default function useSentimentTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["SentimentTrainModel"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(sentimentTrainModel, data);
    },
  });
}
