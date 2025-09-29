import { useMutation } from "@tanstack/react-query";
import { deleteFrImage } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export default function useDeleteFrChunks() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: async (image_id: number) => {
      const url = `${deleteFrImage}${image_id.toString()}/`;
      return axiosInstance.delete(url);
    },
  });
}
