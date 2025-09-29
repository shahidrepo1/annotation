import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { AdAudioModal } from "./AdAudioModal";
import useAdAudioFileUpload from "../../../api/useAdAudioFileUpload";
import { toast } from "react-toastify";
import { AudioProcessingResponse } from "../../../api/useAdAudioSegment";
import AdAudioFileUpload from "./AdAudioFileUpload";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type AdUploadMediaModalProps = {
  onUploadSuccess: (data: AudioProcessingResponse) => void;
  onClose: () => void;
};

export const AdAudioUploadMediaModal = ({
  onUploadSuccess,
  onClose,
}: AdUploadMediaModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    mutate: fileUpload,
    isPending,
    isError,
    error,
  } = useAdAudioFileUpload();
  const [data, setData] = useState<AudioProcessingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fileUpload(
      { file: formData, module_name: "AD" },

      {
        onSuccess: (response) => {
          const responseData = response.data as AudioProcessingResponse;
          setFile(null);
          setData(responseData);
          setIsModalOpen(true);
          toast.success("File uploaded successfully!");
          onClose();
          onUploadSuccess(responseData);
          void queryClient.invalidateQueries({ queryKey: ["AudioSegments"] });
          void queryClient.invalidateQueries({ queryKey: ["AdSegments"] });
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as {
              message?: string;
              error?: string;
            };
            toast.error(err?.message || "Upload failed. Please try again.");
          } else {
            toast.error("Something went wrong during upload.");
          }
        },
      }
    );
  };

  return (
    <>
      {isModalOpen && (
        <Modal>
          <AdAudioModal
            data={data || ({} as AudioProcessingResponse)}
            onSave={() => {
              setIsModalOpen(false);
            }}
            onClose={() => {
              setIsModalOpen(false);
            }}
          />
        </Modal>
      )}

      <form onSubmit={handleUpload}>
        <AdAudioFileUpload
          file={file}
          onFileChange={(file) => {
            setFile(file);
            setErrorMessage(file ? null : "Please upload a valid file.");
          }}
          errorMessage={errorMessage}
        />
        <div className="text-center mt-4">
          <Button disabled={!file || isPending}>
            {isPending ? "Uploading..." : "Upload"}
          </Button>
          {isError && (
            <p className="mt-4 text-red-500 text-sm">
              {error.message || "An error occurred while uploading."}
            </p>
          )}
        </div>
      </form>
    </>
  );
};
