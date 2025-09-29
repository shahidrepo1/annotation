import { useMutation } from "@tanstack/react-query";
import { adAudioFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type Data = {
  file: FormData;
  module_name: string;
};

function useAdAudioFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ file, module_name }: Data) => {
      file.append("module_name", module_name);
      return axiosInstance.post(adAudioFileUpload, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useAdAudioFileUpload;
