import { useMutation } from "@tanstack/react-query";
import { deleteOcrMedia } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export default function useDeleteOCRMediaChunks() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: async (frameIds: Array<number>) => {
      return axiosInstance.post(deleteOcrMedia, {
        frame_ids: frameIds,
      });
    },
  });
}
