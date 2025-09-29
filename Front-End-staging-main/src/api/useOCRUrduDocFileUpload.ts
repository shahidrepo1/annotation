import { useMutation } from "@tanstack/react-query";
import { ocrDocFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { DocumentDataResponse } from "./useOCRUrduDocResponse.types";

type Data = {
  formData: FormData;
  language: string;
  module: string;
  submodule: string;
};

function useOCRUrduDocUploadFile() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationKey: ["ocrDocUrduFileUpload"],
    mutationFn: async ({ formData, language, module, submodule }: Data) => {
      formData.append("language", language);
      formData.append("module", module);
      formData.append("submodule", submodule);
      const response = await axiosInstance.post<DocumentDataResponse>(
        ocrDocFileUpload,
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

export default useOCRUrduDocUploadFile;
