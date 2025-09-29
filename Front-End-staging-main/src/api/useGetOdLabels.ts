import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getOdLabels } from "./apiConstants";
import { OdLabels } from "./useGetOdLabels.types";

function useGetOdLabels() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["OdLabels"],
    queryFn: async () => {
      const response = await axiosInstance.get<OdLabels>(getOdLabels);
      return response.data;
    },
  });
}
export default useGetOdLabels;
