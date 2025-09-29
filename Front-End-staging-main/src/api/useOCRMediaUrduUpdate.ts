import { useMutation } from "@tanstack/react-query";
import { updateOcrMedia } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type UpdateFrame = {
  frame_id: number;
  extracted_text: string;
};

type UpdateProps = {
  media_file_id: number;
  frames: Array<UpdateFrame>;
};

export default function useMediaUrduUpdate() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.post(updateOcrMedia, data);
    },
  });
}
