import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getTfLabels } from "./apiConstants";
import { Labels } from "./useGetTfLabels.types";

function useGetTfLabels() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["AdLabels"],
    queryFn: async () => {
      const response = await axiosInstance.get<Labels>(getTfLabels);
      return response.data;
    },
  });
}
export default useGetTfLabels;
