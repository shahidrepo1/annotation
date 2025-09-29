import { useMutation } from "@tanstack/react-query";
import { classifySttChunk } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type DataProps = {
  chunk_ids: Array<number>;
};

export default function useClassifyChunks() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["classifySttChunks"],
    mutationFn: (data: DataProps) => {
      const response = axiosInstance.post(classifySttChunk, data);
      return response;
    },
  });
}
