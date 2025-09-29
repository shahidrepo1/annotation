import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getLogoAnnotatedImage } from "./apiConstants";
import { LogoDetectionDataType } from "./useGetLogoData.types";
import { useSearchParams } from "react-router";

function useGetLogoAnnotatedImage() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const activeTab = searchParams.get("active") || "ViewAll";
  const date = searchParams.get("date") || "";
  const page = searchParams.get("page") || "1";
  return useQuery({
    queryKey: ["LogoAnnotatedImage", startDate, endDate, activeTab, date, page],
    queryFn: async () => {
      const response = await axiosInstance.get<LogoDetectionDataType>(
        getLogoAnnotatedImage,
        {
          params: {
            startDate: startDate?.slice(0, 10),
            endDate: endDate?.slice(0, 10),
            active: activeTab,
            date,
            page,
          },
        }
      );
      return response.data;
    },
  });
}
export default useGetLogoAnnotatedImage;
