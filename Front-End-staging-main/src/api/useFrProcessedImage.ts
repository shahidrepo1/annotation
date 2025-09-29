import { useMutation } from "@tanstack/react-query";
import { processedImage } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type UpdateProps = {
  updates: Array<{
    image_id: number;
    label: string;
  }>;
};

export default function useFrProcessedImage() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.patch(processedImage, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["processedImages"],
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
}
