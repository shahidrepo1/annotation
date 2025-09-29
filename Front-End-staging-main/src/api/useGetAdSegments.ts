import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getAdSegments } from "./apiConstants";
import { AdSegmentsData } from "./useAdSegments.types";
import { useSearchParams } from "react-router";
function useGetAdSegments() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const label = searchParams.get("label") || "";
  return useQuery({
    queryKey: ["AdSegments", startDate, endDate, activeTab, label],
    queryFn: async () => {
      const response = await axiosInstance.get<AdSegmentsData>(getAdSegments, {
        params: {
          startDate,
          endDate,
          active: activeTab,
          label,
        },
      });
      return response.data;
    },
  });
}
export default useGetAdSegments;
