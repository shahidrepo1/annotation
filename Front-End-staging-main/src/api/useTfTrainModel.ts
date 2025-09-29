import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { tfTrainModel } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Array<number>;
  forUntrain: Array<number>;
  reTrain: Record<string, Array<number>>;
};
export default function useTfTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["tfTrainModel"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(tfTrainModel, data);
    },
  });
}
