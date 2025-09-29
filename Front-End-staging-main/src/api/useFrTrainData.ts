import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { frTrainModel } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Record<string, Array<number>>;
  forUntrain: Record<string, Array<number>>;
  reTrain: Record<string, Array<number>>;
};
export default function useFrTrainData() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["frTrainData"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(frTrainModel, data);
    },
  });
}
