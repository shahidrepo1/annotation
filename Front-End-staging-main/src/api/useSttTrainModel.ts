import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { sttTrainModel } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Array<number>;
  forUntrain: Array<number>;
};
export default function useSttTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["sttTrainModel"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(sttTrainModel, data);
    },
  });
}
