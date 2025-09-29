import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { odTrainModel } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Array<number>;
  forUntrain: Array<number>;
  reTrain: Record<string, Array<number>>;
};
export default function useOdTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["OdTrainModel"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(odTrainModel, data);
    },
  });
}
