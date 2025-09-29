import { useMutation } from "@tanstack/react-query";
import { updateSpeakerUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

type DataProps = {
  oldSpeaker: string;
  newSpeaker: string;
  file: Array<string>;
};

function useUpdateSpeaker() {
  const axiosInstance = useAxiosPrivate();
  return useMutation({
    mutationFn: async (data: DataProps) => {
      return axiosInstance.post(updateSpeakerUrl, data);
    },
  });
}
export default useUpdateSpeaker;
