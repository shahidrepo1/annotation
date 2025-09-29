import { useMutation } from "@tanstack/react-query";
import { sttFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { SttTranscription } from "./useSttFileUpload.types";

type Data = {
  formData: FormData;
  moduleName: string;
};

function useSttUploadFile() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["sttFileUpload"],
    mutationFn: async ({ formData, moduleName }: Data) => {
      formData.append("moduleName", moduleName);
      const response = await axiosInstance.post<SttTranscription>(
        sttFileUpload,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
  });
}

export default useSttUploadFile;
