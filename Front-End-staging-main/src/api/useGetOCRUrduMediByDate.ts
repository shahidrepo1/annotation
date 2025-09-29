import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getOcrDataByDate } from "./apiConstants";
import { TrainingDataResponse } from "./useGetOCRUrduMediByDate.types";

function useGetOCRUrduMediByDate() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["ocrFolders"],
    queryFn: async () => {
      const response = await axiosInstance.get<TrainingDataResponse>(
        getOcrDataByDate
      );
      return response.data;
    },
  });
}
export default useGetOCRUrduMediByDate;
