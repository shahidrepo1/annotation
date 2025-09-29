import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { adGetTrainedData } from "./apiConstants";
import { Models } from "./useGetAdTrainedData.types";

function useGetAdTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["AdTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<Models>(adGetTrainedData, {
        params: {
          module_name: "AD",
        },
      });
      return response.data;
    },
  });
}
export default useGetAdTrainedData;
