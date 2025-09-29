import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getSentiments } from "./apiConstants";
import { useSearchParams } from "react-router";
import { SentimentDataResponse } from "./useGetSentiment.types";

function useGetSentiments() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const label = searchParams.get("label") || "";

  return useQuery({
    queryKey: ["allSentiments", startDate, endDate, activeTab, label],
    queryFn: async () => {
      const response = await axiosInstance.get<SentimentDataResponse>(
        getSentiments,
        {
          params: {
            startDate,
            endDate,
            active: activeTab,
            label,
          },
        }
      );
      return response.data;
    },
  });
}
export default useGetSentiments;
