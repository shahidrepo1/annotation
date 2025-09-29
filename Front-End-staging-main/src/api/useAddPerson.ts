import { useMutation } from "@tanstack/react-query";
import { addPersonUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { queryClient } from "../main";

type DataProps = {
  labelName: string;
};

export default function useAddPerson() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: (data: DataProps) => {
      return axiosInstance.post(addPersonUrl, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["audio-chunks"],
      });
    },
  });
}
