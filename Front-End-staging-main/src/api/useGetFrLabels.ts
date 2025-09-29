import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getFrLabels } from "./apiConstants";
import { FrLabelList } from "./useGetFr.type";

function useGetFrLabels() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["FrLabel"],
    queryFn: async () => {
      const response = await axiosInstance.get<FrLabelList>(getFrLabels);
      return response.data;
    },
  });
}
export default useGetFrLabels;
