import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getUrduMediaTrainedData } from "./apiConstants";
import { TrainingModel } from "./useGetOcrTrainedData.types";

function useGetOcrTrainedData() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["OcrTrainedData"],
    queryFn: async () => {
      const response = await axiosPrivate.get<TrainingModel>(
        getUrduMediaTrainedData,
        {
          params: {
            module_name: "OCR",
            subsubmodule_name: "UrduMedia",
          },
        }
      );
      return response.data;
    },
  });
}
export default useGetOcrTrainedData;
