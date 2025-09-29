import { useMutation } from "@tanstack/react-query";
import { addOdLabel } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

export type OdAddLabel = {
  label_name: string;
};

export default function useOdAddLabel() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: (data: OdAddLabel) => {
      const response = axiosInstance.post<OdAddLabel>(addOdLabel, data);
      return response;
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["OdAddLabel"],
      });
    },
  });
}
