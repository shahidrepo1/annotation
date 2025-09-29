import { useMutation } from "@tanstack/react-query";
import { logoDeleteImage } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export default function useDeleteLogoChunks() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: async (label_ids: Array<number>) => {
      const url = logoDeleteImage;
      return axiosInstance.post(url, {
        label_ids,
      });
    },
  });
}
