import { useMutation } from "@tanstack/react-query";
import { adFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type Data = {
  file: FormData;
  module_name: string;
};

function useAdFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ file, module_name }: Data) => {
      file.append("module_name", module_name);
      return axiosInstance.post(adFileUpload, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useAdFileUpload;
