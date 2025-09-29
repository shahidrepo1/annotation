import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { logoGetTrainedData } from "./apiConstants";
import { LogoModel } from "./useLogoTrainedData.types";

function useGetLogoTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["LogoTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<LogoModel>(logoGetTrainedData, {
        params: {
          module_name: "LOGO",
        },
      });
      return response.data;
    },
  });
}
export default useGetLogoTrainedData;
