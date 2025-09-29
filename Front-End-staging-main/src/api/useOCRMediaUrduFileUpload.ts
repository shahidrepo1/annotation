import { useMutation } from "@tanstack/react-query";
import { ocrFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { OCRMediaResponse } from "./useOCRMediaUrduResponse.types";

type Data = {
  formData: FormData;
  language: string;
  module: string;
  submodule: string;
};

function useOCRMediaUrduUploadFile() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["ocrMediaUrduFileUpload"],
    mutationFn: async ({ formData, language, module, submodule }: Data) => {
      formData.append("language", language);
      formData.append("module", module);
      formData.append("submodule", submodule);
      const response = await axiosInstance.post<OCRMediaResponse>(
        ocrFileUpload,
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

export default useOCRMediaUrduUploadFile;
