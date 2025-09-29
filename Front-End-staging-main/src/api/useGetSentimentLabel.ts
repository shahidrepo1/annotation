import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getLabelsSentiment } from "./apiConstants";
import { SentimentLabels } from "./useGetSentimentLabel.types";

function useGetSentimentLabels() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["SentimentLabels"],
    queryFn: async () => {
      const response = await axiosInstance.get<SentimentLabels>(
        getLabelsSentiment
      );
      return response.data;
    },
  });
}
export default useGetSentimentLabels;
