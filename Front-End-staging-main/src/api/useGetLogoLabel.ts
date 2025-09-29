import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getLabels } from "./apiConstants";

function useGetLogoLabel() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["LogoLabel"],
    queryFn: async () => {
      const response = await axiosInstance.get<string>(getLabels);
      return response.data;
    },
  });
}
export default useGetLogoLabel;
