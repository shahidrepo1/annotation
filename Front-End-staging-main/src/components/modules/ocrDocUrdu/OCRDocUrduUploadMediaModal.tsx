import { useState } from "react";
import OCRDocUrduFileUpload from "./OCRDocUrduFileUpload";
import Button from "../../ui/Button";
import { toast } from "react-toastify";
import axios from "axios";
import useOCRUrduDocUploadFile from "../../../api/useOCRUrduDocFileUpload";
import { DocumentDataResponse } from "../../../api/useOCRUrduDocResponse.types";

type Props = {
  onUploadSuccess: (data: DocumentDataResponse) => void;
  onClose: () => void;
};

export const OCRDocUrduUploadMediaModal = ({
  onClose,
  onUploadSuccess,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate, isPending, isError, error } = useOCRUrduDocUploadFile();

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(
      { formData, language: "urdu", module: "ocr", submodule: "UrduDocument" },
      {
        onSuccess: (responseData: DocumentDataResponse) => {
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
      <OCRDocUrduFileUpload
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
