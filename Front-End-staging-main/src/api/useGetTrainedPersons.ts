import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { backendServiceUrl } from "./apiConstants";
import { AllAudioData } from "./useGetAllAudioChunks.types";

function useGetTrainedPersons() {
  const axiosInstance = useAxiosPrivate();
  return useQuery({
    queryKey: ["trained-persons"],
    queryFn: async () => {
      const response = await axiosInstance.get<AllAudioData>(
        `${backendServiceUrl}sr/api/labels/`
      );
      return response.data;
    },
  });
}
export default useGetTrainedPersons;
