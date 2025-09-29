import { useMutation } from "@tanstack/react-query";
import { deleteLabelSentiment } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export default function useSentimentDeleteLabel() {
  const axiosInstance = useAxiosPrivate();

  return useMutation({
    mutationFn: async (analysis_id: number) => {
      const url = `${deleteLabelSentiment}${analysis_id.toString()}/`;
      return axiosInstance.delete(url);
    },
  });
}
