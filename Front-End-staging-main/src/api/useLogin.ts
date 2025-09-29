import { useMutation } from "@tanstack/react-query";
import { axiosInstance, loginUrl } from "./apiConstants";

type LoginProps = {
  email: string;
  password: string;
};

export default function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginProps) => {
      const response = await axiosInstance.post<LoginProps>(loginUrl, {
        ...data,
        portal: "user",
      });
      return response.data;
    },
  });
}
