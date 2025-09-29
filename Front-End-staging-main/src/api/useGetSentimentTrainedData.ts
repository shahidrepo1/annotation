import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { sentimentGetTrainedData } from "./apiConstants";
import { SentimentTrainedResponse } from "./useSentimentTrainedData.types";

function useGetSentimentTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["SentimentTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<SentimentTrainedResponse>(
        sentimentGetTrainedData,
        {
          params: {
            module_name: "sentiment",
          },
        }
      );
      return response.data;
    },
  });
}
export default useGetSentimentTrainedData;
