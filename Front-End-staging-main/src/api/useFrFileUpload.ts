import { useMutation } from "@tanstack/react-query";
import { frFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type Data = {
  formData: FormData;
  module_name: string;
};

function useFrFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ formData, module_name }: Data) => {
      formData.append("module_name", module_name);
      return axiosInstance.post(frFileUpload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useFrFileUpload;
