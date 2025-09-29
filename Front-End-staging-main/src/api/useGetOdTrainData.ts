import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { odGetTrainedData } from "./apiConstants";
import { ODModelList } from "./useGetOdTrainedData.types";

function useGetOdTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["OdTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<ODModelList>(odGetTrainedData, {
        params: {
          module_name: "OD",
        },
      });
      return response.data;
    },
  });
}
export default useGetOdTrainedData;
