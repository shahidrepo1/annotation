import { useMutation } from "@tanstack/react-query";
import { updateAdChunks } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type UpdateProps = {
  updates: Array<{
    chunk_id: number;
    label: string;
  }>;
};

export default function useAdUpdateChunks() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.patch(updateAdChunks, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["AdUpdateChunks"],
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
}
