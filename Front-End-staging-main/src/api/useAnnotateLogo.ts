import { useMutation } from "@tanstack/react-query";
import { logoAnnotate } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type LabelUpdate = {
  id?: number;
  delete?: boolean;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type UpdateProps = Array<{
  id: number;
  labels: Array<LabelUpdate>;
}>;

export default function useAnnotateLogo() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["annotateLogoData"],
    mutationFn: async (data: UpdateProps) => {
      const response = await axiosInstance.post<UpdateProps>(
        logoAnnotate,
        data
      );
      return response.data;
    },
  });
}
