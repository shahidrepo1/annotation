import { useMutation } from "@tanstack/react-query";
import { sentimentFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { SentimentData } from "./useSentimentResponse.types";

type Data = {
  file: FormData;
  module_name: string;
  language: string;
};

function useSentimentFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ file, module_name, language }: Data) => {
      file.append("module_name", module_name);
      file.append("language", language);
      return axiosInstance.post<SentimentData>(sentimentFileUpload, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useSentimentFileUpload;
