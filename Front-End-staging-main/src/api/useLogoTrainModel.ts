import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { logoTrainModel } from "./apiConstants";

type DataProps = {
  moduleName: string;
  forTrain: Array<number>;
  forUntrain: Array<number>;
};
export default function useLogoTrainModel() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["logoTrainModel"],
    mutationFn: async (data: DataProps) => {
      return axiosPrivate.post(logoTrainModel, data);
    },
  });
}
