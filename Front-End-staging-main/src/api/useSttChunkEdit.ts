import { useMutation } from "@tanstack/react-query";
import { sttChunksEdit } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type DataProps = {
  job_id: number;
  chunk_id: number;
  transcription: string;
};

function useSttChunkEdit() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: async (data: DataProps) => {
      const response = await axiosInstance.post<DataProps>(sttChunksEdit, data);
      return response.data;
    },
  });
}

export default useSttChunkEdit;
