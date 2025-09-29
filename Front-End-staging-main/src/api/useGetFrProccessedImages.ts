import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getProccessedImages } from "./apiConstants";
import { FrProcessedDataType } from "./useFrLabelChunks.types";
import { useSearchParams } from "react-router";

function useGetFrProccessedImages() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const label = searchParams.get("label") || "";

  return useQuery({
    queryKey: ["ProccessedImages", startDate, endDate, activeTab, label],
    queryFn: async () => {
      const response = await axiosInstance.get<FrProcessedDataType>(
        getProccessedImages,
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
export default useGetFrProccessedImages;
