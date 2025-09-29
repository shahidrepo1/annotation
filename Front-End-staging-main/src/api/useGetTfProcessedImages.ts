import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getTfProcessedImages } from "./apiConstants";
import { useSearchParams } from "react-router";
import { TickerTrainingDataType } from "./useGetTfProcessedImages.types";

function useGetTfProccessedImages() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const label = searchParams.get("label") || "";

  return useQuery({
    queryKey: ["TfProccessedImages", startDate, endDate, activeTab, label],
    queryFn: async () => {
      const response = await axiosInstance.get<TickerTrainingDataType>(
        getTfProcessedImages,
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
export default useGetTfProccessedImages;
