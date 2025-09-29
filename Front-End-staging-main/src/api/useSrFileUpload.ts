import { useMutation } from "@tanstack/react-query";
import { fileUploadUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type Data = {
  formData: FormData;
  moduleName: string;
};

function useSrUploadFile() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ formData, moduleName }: Data) => {
      formData.append("moduleName", moduleName);
      return axiosInstance.post(fileUploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useSrUploadFile;
