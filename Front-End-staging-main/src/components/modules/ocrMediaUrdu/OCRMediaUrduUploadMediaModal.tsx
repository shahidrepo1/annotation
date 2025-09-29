import { useState } from "react";
import OCRMediaFileUpload from "./OCRMediaUrduFileUpload";
import Button from "../../ui/Button";
import useOCRMediaUrduUploadFile from "../../../api/useOCRMediaUrduFileUpload";
import { OCRMediaResponse } from "../../../api/useOCRMediaUrduResponse.types";
import { toast } from "react-toastify";
import axios from "axios";

type Props = {
  onUploadSuccess: (data: OCRMediaResponse) => void;
  onClose: () => void;
};

export const OCRMediaUploadMediaModal = ({
  onClose,
  onUploadSuccess,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    mutate: fileUpload,
    isPending,
    isError,
    error,
  } = useOCRMediaUrduUploadFile();

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fileUpload(
      { formData, language: "urdu", module: "OCR", submodule: "UrduMedia" },
      {
        onSuccess: (responseData: OCRMediaResponse) => {
          toast.success("File uploaded successfully!");
          setFile(null);
          onClose();
          onUploadSuccess(responseData);
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as {
              error: string;
              details: { response: { detail: string } };
            };
            const errorMessage =
              err.error ||
              err.details?.response?.detail ||
              "Upload failed. Please try again.";
            toast.error(errorMessage);
            onClose();
          } else {
            toast.error("Something went wrong during upload.");
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleUpload}>
      <OCRMediaFileUpload
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
  );
};
