import { useMutation } from "@tanstack/react-query";
import { adAddLabel } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type DataProps = {
  label_name: string;
};

export default function useAdAddLabel() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: (data: DataProps) => {
      const response = axiosInstance.post(adAddLabel, data);
      return response;
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["AdAddLabel"],
      });
    },
  });
}
