import { useMutation } from "@tanstack/react-query";
import { updateOcrDoc } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type UpdateProps = {
  media_file_id: number;
  extracted_text_id: number;
  extracted_text: string;
};

export default function useDocUrduUpdate() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.post(updateOcrDoc, data);
    },
  });
}
