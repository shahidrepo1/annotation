import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { frGetTrainedData } from "./apiConstants";
import { ModelType } from "./useGetFrTrainedData.types";

function useGetFrTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["FrTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<ModelType>(frGetTrainedData, {
        params: {
          module_name: "FR",
        },
      });
      return response.data;
    },
  });
}
export default useGetFrTrainedData;
