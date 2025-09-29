import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { adTrainAudio } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Record<string, Array<number>>;
  forUntrain: Record<string, Array<number>>;
  reTrain: Record<string, Array<number>>;
};
export default function useAdTrainAudio() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["adTrainAudio"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(adTrainAudio, data);
    },
  });
}
