import { useMutation } from "@tanstack/react-query";
import { tickerFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { TickerResponse } from "./useTickerUpload.types";

type Data = {
  file: FormData;
  module_name: string;
};

function useTickerFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ file, module_name }: Data) => {
      file.append("module_name", module_name);
      return axiosInstance.post<TickerResponse>(tickerFileUpload, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useTickerFileUpload;
