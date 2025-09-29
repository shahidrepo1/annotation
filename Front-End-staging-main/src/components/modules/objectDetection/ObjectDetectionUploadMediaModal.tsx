import { useState } from "react";
import useOdFileUpload from "../../../api/useOdFileUpload";
import TickerFileUpload from "../ticker&flasher/TickerFileUpload";
import Button from "../../ui/Button";
import { toast } from "react-toastify";
import { ProcessedDataResponse } from "../../../api/useObjectResponse.types";
import { ObjectDetectionImageDisplay } from "./ObjectDetectionImageDisplay";
import axios from "axios";
export const ObjectDetectionUploadMediaModal = ({
  setOpen,
  setOdData,
  odData,
}: {
  setOpen: (open: boolean) => void;
  setOdData: (data: ProcessedDataResponse) => void;
  odData: ProcessedDataResponse | null;
}) => {
  const { mutate, isPending } = useOdFileUpload();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isPending) {
    return <div>Loading...</div>;
  }

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(
      { file: formData, module_name: "OD" },

      {
        onSuccess: (response) => {
          setFile(null);
          setOdData(response.data);
          setIsModalOpen(true);
          setOpen(false);
          toast.success("File uploaded successfully!");
        },
        onError: (error: unknown) => {
          setOpen(false);
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as {
              error?: string;
              details?: string;
            };
            toast.error(err?.error || "Something went wrong during uploading.");
          } else {
            toast.error("Something went wrong.");
          }
        },
      }
    );
  };
  return (
    <>
      <form onSubmit={handleUpload}>
        <div className="border border-indigo-500 p-20">
          <TickerFileUpload
            file={file}
            onFileChange={(file) => {
              setFile(file);
              setErrorMessage(file ? null : "Please upload a valid file.");
            }}
            errorMessage={errorMessage}
          />
          <div className="text-center mt-4">
            <Button>Upload</Button>
          </div>
        </div>
      </form>

      {isModalOpen && (
        <ObjectDetectionImageDisplay
          odData={odData}
          onCloseModal={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};
