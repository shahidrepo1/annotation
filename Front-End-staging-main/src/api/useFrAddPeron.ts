import { useMutation } from "@tanstack/react-query";
import { frAddLabel } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type DataProps = {
  label_name: string;
};

export default function useFrAddPerson() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: (data: DataProps) => {
      //   return axiosInstance.post(frAddLabel, data);
      const response = axiosInstance.post(frAddLabel, data);
      return response;
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["frAddPerson"],
      });
    },
  });
}
