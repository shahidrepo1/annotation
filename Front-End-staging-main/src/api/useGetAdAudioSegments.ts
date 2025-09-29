import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getAdAudioSegments } from "./apiConstants";
import { DataType } from "./useGetAdAudio.types";
import { useSearchParams } from "react-router-dom";

function useGetAdAudioSegments() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const label = searchParams.get("label") || "";
  return useQuery({
    queryKey: ["AudioSegments", startDate, endDate, activeTab, label],
    queryFn: async () => {
      const response = await axiosInstance.get<DataType>(getAdAudioSegments, {
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
export default useGetAdAudioSegments;
