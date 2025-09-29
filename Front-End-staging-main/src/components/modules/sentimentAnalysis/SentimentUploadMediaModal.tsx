import { useState } from "react";
import Modal from "../../ui/Modal";
import { SentimentModal } from "./SentimentModal";
import SentimentFileUpload from "./SentimentFileUpload";
import Button from "../../ui/Button";
import useSentimentFileUpload from "../../../api/useSentimentFileUpload";
import { toast } from "react-toastify";
import axios from "axios";
import { SentimentData } from "../../../api/useSentimentResponse.types";

export const SentimentUploadMediaModal = ({
  setOpen,
  setSentimentData,
  sentimentData,
}: {
  setOpen: (open: boolean) => void;
  setSentimentData: (data: SentimentData) => void;
  sentimentData: SentimentData | null;
}) => {
  const { mutate, isPending, isError, error } = useSentimentFileUpload();
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(
      { file: formData, module_name: "sentiment", language: "Urdu" },

      {
        onSuccess: (data) => {
          setSentimentData(data.data);
          setFile(null);
          toast.success("File uploaded successfully!");
          setOpen(true);
          setIsModalOpen(true);
        },
        onError: (error: unknown) => {
          setOpen(false);
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { error: { error: string } };
            toast.error(
              err?.error?.error || "Upload failed. Please try again."
            );
          } else {
            toast.error("Something went wrong during upload.");
          }
        },
      }
    );
  };

  return (
    <>
      <form onSubmit={handleUpload}>
        <SentimentFileUpload
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

      {isModalOpen && sentimentData && (
        <Modal>
          <SentimentModal
            data={sentimentData}
            setIsModalOpen={setIsModalOpen}
          />
        </Modal>
      )}
    </>
  );
};
