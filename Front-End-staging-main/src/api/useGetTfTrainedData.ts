import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { tfGetTrainedData } from "./apiConstants";
import { ModelListType } from "./useTfTrainedData.types";

function useGetTfTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["TfTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<ModelListType>(tfGetTrainedData, {
        params: {
          module_name: "TF",
        },
      });
      return response.data;
    },
  });
}
export default useGetTfTrainedData;
