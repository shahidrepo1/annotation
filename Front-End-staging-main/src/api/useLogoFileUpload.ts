import { useMutation } from "@tanstack/react-query";
import { logoFileUpload } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { LogoImageList } from "./useLogoResponse.types";

type Data = {
  image: FormData;
  moduleName: string;
};

function useLogoFileUpload() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async ({ image, moduleName }: Data) => {
      image.append("moduleName", moduleName);
      return axiosInstance.post<LogoImageList>(logoFileUpload, image, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default useLogoFileUpload;
