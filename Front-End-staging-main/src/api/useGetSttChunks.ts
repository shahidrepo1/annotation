import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getSttChunks } from "./apiConstants";
import { SttTranscription } from "./useSttFileUpload.types";
import { useSearchParams } from "react-router";

function useGetSttChunks() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "sttViewAll";
  const transcription = searchParams.get("transcription") || "";
  return useQuery({
    queryKey: ["SttChunks", startDate, endDate, activeTab, transcription],
    queryFn: async () => {
      const response = await axiosInstance.get<SttTranscription>(getSttChunks, {
        params: {
          startDate: startDate?.slice(0, 10),
          endDate: endDate?.slice(0, 10),
          active: activeTab,
          transcription,
        },
      });
      return response.data;
    },
  });
}
export default useGetSttChunks;
