import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { sttGetTrainedData } from "./apiConstants";
import { DailyVersionType } from "./useGetSttTrainedData.types";

function useGetSttTrainedData() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["sttTrainedData"],
    queryFn: async () => {
      const response = await axiosInstance.get<Array<DailyVersionType>>(
        sttGetTrainedData
      );
      return response.data;
    },
  });
}
export default useGetSttTrainedData;
