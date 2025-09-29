import { useQuery } from "@tanstack/react-query";
import { getAllAudioChunksUrl } from "./apiConstants";
import { AllAudioData } from "./useGetAllAudioChunks.types";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { useSearchParams } from "react-router-dom";

export default function useGetAllAudioChunks() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const speaker = searchParams.get("speaker") || "";

  return useQuery({
    queryKey: ["allAudioChunks", startDate, endDate, activeTab, speaker],
    queryFn: async () => {
      const response = await axiosInstance.get<AllAudioData>(
        getAllAudioChunksUrl,
        {
          params: {
            startDate: startDate?.slice(0, 10),
            endDate: endDate?.slice(0, 10),
            active: activeTab,
            speaker,
          },
        }
      );
      return response.data;
    },
  });
}
