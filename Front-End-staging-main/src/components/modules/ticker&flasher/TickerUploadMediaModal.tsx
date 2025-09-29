import { useState } from "react";
import TickerFileUpload from "./TickerFileUpload";
import useTickerFileUpload from "../../../api/useTickerFileUpload";
import Button from "../../ui/Button";
import { toast } from "react-toastify";
import { TickerResponse } from "../../../api/useTickerUpload.types";
import { TickerModal } from "./TickerModal";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
export const TickerUploadMediaModal = ({
  setOpen,
  setTfData,
  tfData,
}: {
  setOpen: (open: boolean) => void;
  setTfData: (data: TickerResponse) => void;
  tfData: TickerResponse | null;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate, isPending } = useTickerFileUpload();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
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
      { file: formData, module_name: "TF" },

      {
        onSuccess: (response) => {
          setFile(null);
          setTfData(response.data);
          setIsModalOpen(true);
          setOpen(false);
          void queryClient.invalidateQueries({
            queryKey: ["TfProccessedImages"],
          });

          void queryClient.invalidateQueries({ queryKey: ["AdLabels"] });
          toast.success("File uploaded successfully!");
        },
        onError: (error: unknown) => {
          setOpen(false);
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { message?: string };
            toast.error(err?.message || "Unable to upload file.");
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
        <TickerModal
          tfData={tfData}
          onCloseModal={() => {
            setIsModalOpen(false);
            setTfData({ message: "", data: [] });
          }}
        />
      )}
    </>
  );
};
