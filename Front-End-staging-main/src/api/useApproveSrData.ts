import { useMutation } from "@tanstack/react-query";
import { approveSrDataUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
type Data = {
  id: number;
};

export default function useApproveSrData() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["approveData"],
    mutationFn: async (data: Data) => {
      const response = await axiosInstance.post<Data>(approveSrDataUrl, {
        ...data,
      });
      return response.data;
    },
  });
}
