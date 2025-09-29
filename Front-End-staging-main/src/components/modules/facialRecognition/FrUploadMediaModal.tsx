import { useState } from "react";
import useFrFileUpload from "../../../api/useFrFileUpload";
import FileUpload from "../speakerRecognition/FileUpload";
import Button from "../../ui/Button";
import { toast } from "react-toastify";
import Modal from "../../ui/Modal";
import { FrModal } from "./FrModal";
import { FrType } from "../../../api/useFrChunks.types";

export const FrUploadMediaModal = ({
  setOpen,
  onUploadSuccess,
}: {
  setOpen: (open: boolean) => void;
  onUploadSuccess: (data: FrType) => void;
}) => {
  const { mutate, isPending, isError, error } = useFrFileUpload();
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setStatus] = useState(false);
  const [frData, setFrData] = useState<FrType | null>(null);
  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(
      { formData, module_name: "FR" },
      {
        onSuccess: (response: { data: FrType }) => {
          toast.success("File uploaded successfully!");
          onUploadSuccess(response.data);
          setFrData(response.data);
          setIsModalOpen(true);
          setIsModalOpen(true);
          setOpen(false);
          setStatus(true);
        },
        onError: (uploadError) => {
          console.error("Upload failed:", uploadError);
        },
      }
    );
  };

  return (
    <>
      <form onSubmit={handleUpload}>
        <FileUpload
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

      {isModalOpen && frData && (
        <Modal>
          <FrModal
            frData={frData}
            onSave={() => {
              setIsModalOpen(true);
            }}
            onClose={() => {
              setIsModalOpen(false);
            }}
          />
        </Modal>
      )}
    </>
  );
};
