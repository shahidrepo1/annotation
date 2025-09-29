import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { adTrainVideo } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Record<string, Array<number>>;
  forUntrain: Record<string, Array<number>>;
  reTrain: Record<string, Array<number>>;
};
export default function useAdTrainVideo() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["adTrainVideo"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(adTrainVideo, data);
    },
  });
}
