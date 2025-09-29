import { useMutation } from "@tanstack/react-query";
import { tfprocessedImage } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

export type UpdateProps = Array<{
  processed_image_id: number;
  detections: Array<
    | {
        id: number;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        label?: string;
        delete?: boolean;
      }
    | {
        x: number;
        y: number;
        width: number;
        height: number;
        label: string;
      }
  >;
}>;

export default function useTfProcessedImage() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.post(tfprocessedImage, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["tfProcessedImages"],
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
}
