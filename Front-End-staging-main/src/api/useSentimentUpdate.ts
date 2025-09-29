import { useMutation } from "@tanstack/react-query";
import { updateSentiment } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type UpdateProps = {
  updates: Array<{
    analysis_id: number;
    label: string;
  }>;
};

export default function useSentimentUpdate() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: (data: UpdateProps) => {
      return axiosInstance.patch(updateSentiment, data);
    },
  });
}
