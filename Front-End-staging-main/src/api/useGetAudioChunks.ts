import { useMutation } from "@tanstack/react-query";
import { getAudioChunks } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type DataProps = {
  fileId: number;
};

export default function useGetAudioChunks() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async (data: DataProps) => {
      return axiosInstance.post(getAudioChunks, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["audio-chunks"],
      });
    },
  });
}
