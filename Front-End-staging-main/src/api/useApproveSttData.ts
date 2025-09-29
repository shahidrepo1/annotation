import { useMutation } from "@tanstack/react-query";
import { approveSttData } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { SttTranscription } from "./useSttFileUpload.types";

export default function useApproveSttData() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["approveData"],
    mutationFn: async (uploadedFile: number) => {
      const response = await axiosInstance.post<SttTranscription>(
        approveSttData,
        {
          id: uploadedFile,
        }
      );
      return response.data;
    },
  });
}
