import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { srTrainModelUrl } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Record<string, Array<string>>;
  forUntrain: Record<string, Array<string>>;
};
export default function useSrTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["train-model"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(srTrainModelUrl, data);
    },
  });
}
