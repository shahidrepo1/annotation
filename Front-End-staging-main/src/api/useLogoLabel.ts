import { useMutation } from "@tanstack/react-query";
import { logoLabel } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export type LabelPayload = {
  label_name: string;
};
export default function useAnnotateLogo() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["labelData"],
    mutationFn: async (data: LabelPayload) => {
      const response = await axiosInstance.post<LabelPayload>(logoLabel, data);
      return response.data;
    },
  });
}
