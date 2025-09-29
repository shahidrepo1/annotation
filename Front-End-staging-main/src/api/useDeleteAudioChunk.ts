import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAudioUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type AudioChunkDeleteParams = {
  id: number;
  speaker: string;
  audioChunkName: string;
};

export default function useDeleteAudioChunk() {
  const axiosInstance = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AudioChunkDeleteParams) => {
      return axiosInstance.delete(deleteAudioUrl, {
        data: {
          id: data.id,
          speaker: data.speaker,
          audioChunkName: data.audioChunkName,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allAudioChunks"] });
    },
  });
}
