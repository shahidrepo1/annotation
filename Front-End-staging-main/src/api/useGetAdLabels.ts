import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getAdLabels } from "./apiConstants";
import { LabelList } from "./useGetAd.types";

function useGetAdLabels() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["AdLabels"],
    queryFn: async () => {
      const response = await axiosInstance.get<LabelList>(getAdLabels);
      return response.data;
    },
  });
}
export default useGetAdLabels;
