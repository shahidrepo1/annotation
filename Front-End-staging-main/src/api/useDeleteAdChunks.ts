import { useMutation } from "@tanstack/react-query";
import { adDeleteChunk } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export default function () {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: async (chunk_id: number) => {
      const url = `${adDeleteChunk}${chunk_id.toString()}/`;
      return axiosInstance.delete(url);
    },
  });
}
