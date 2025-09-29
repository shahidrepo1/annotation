import { useMutation } from "@tanstack/react-query";
import { odProcessedImage } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type DetectionUpdate =
  | {
      id: number;
      label: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
    }
  | {
      id: number;
      delete: true;
    };

type UpdateProps = Array<{
  processed_image_id: number;
  detections: Array<DetectionUpdate>;
}>;

export default function useOdProcessedImage() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.post(odProcessedImage, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["odProcessedImages"],
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
}
