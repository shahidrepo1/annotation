import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { trainUrduMedia } from "./apiConstants";

type DataProps = {
  submoduleName: string;
  moduleName: string;
  forTrain: Array<number>;
  forUntrain: Array<number>;
};
export default function useOCRMediaTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["ocrUrduTrainModel"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(trainUrduMedia, data);
    },
  });
}
