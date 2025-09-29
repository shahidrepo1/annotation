import { useMutation } from "@tanstack/react-query";
import { objectDetectionFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { ProcessedDataResponse } from "./useObjectResponse.types";

type Data = {
  file: FormData;
  module_name: string;
};

function useOdFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ file, module_name }: Data) => {
      file.append("module_name", module_name);
      return axiosInstance.post<ProcessedDataResponse>(
        objectDetectionFileUpload,
        file,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
  });
}

export default useOdFileUpload;
