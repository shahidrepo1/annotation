import { useMutation } from "@tanstack/react-query";
import { logoutUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

export const useLogoutUser = () => {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: () => {
      return axiosPrivate.post(logoutUrl);
    },
  });
};
