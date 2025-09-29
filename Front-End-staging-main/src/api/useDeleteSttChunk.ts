import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSttChunk } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type SttChunkDelteParams = {
  job_id: number;
  chunk_id: number;
};

export default function useDeleteSttChunk() {
  const axiosInstance = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SttChunkDelteParams) => {
      return axiosInstance.post(deleteSttChunk, {
        job_id: data.job_id,
        chunk_id: data.chunk_id,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classifySttChunks"] });
    },
  });
}
