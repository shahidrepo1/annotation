import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { AdModal } from "./AdVideoModal";
import AdFileUpload from "./AdVideoFileUpload";
import useAdFileUpload from "../../../api/useAdFileUpload";
import { toast } from "react-toastify";
import { AdLabelType } from "../../../api/useGetAdLabels.types";
import axios from "axios";

type AdUploadMediaModalProps = {
  onUploadSuccess: (data: AdLabelType) => void;
  onClose: () => void;
};
export const AdUploadMediaModal = ({
  onUploadSuccess,
  onClose,
}: AdUploadMediaModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: fileUpload, isPending, isError, error } = useAdFileUpload();
  const [adData, setAdData] = useState<AdLabelType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        onSuccess: (response: { data: AdLabelType }) => {
          const responseData: AdLabelType = response.data;
          setFile(null);
          setAdData(responseData);
          setIsModalOpen(true);
          toast.success("File uploaded successfully!");
          onClose();
          onUploadSuccess(responseData);
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
          <AdModal
            onSave={() => {
              setIsModalOpen(false);
            }}
            onClose={() => {
              setIsModalOpen(false);
            }}
            adData={
              adData ?? {
                message: "",
                video_id: 0,
                chunk: [],
              }
            }
          />
        </Modal>
      )}

      <form onSubmit={handleUpload}>
        <AdFileUpload
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
