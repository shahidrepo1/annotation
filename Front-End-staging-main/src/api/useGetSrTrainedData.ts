import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { srTrainedDataUrl } from "./apiConstants";
import { SrTrainedDataType } from "./useGetSrTrainedData.types";

export default function useGetSrTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery<SrTrainedDataType>({
    queryKey: ["srTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<SrTrainedDataType>(
        srTrainedDataUrl,
        {
          params: {
            moduleName: "SR",
          },
        }
      );
      return response.data;
    },
  });
}
