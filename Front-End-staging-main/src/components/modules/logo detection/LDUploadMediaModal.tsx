import { useState } from "react";
import FileUpload from "../speakerRecognition/FileUpload";
import { LDModal } from "./LDModal";
import Button from "../../ui/Button";
import useLogoFileUpload from "../../../api/useLogoFileUpload";
import { toast } from "react-toastify";
import { LogoImageList } from "../../../api/useLogoResponse.types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const LDUploadMediaModal = ({
  setOpen,
  setLogoData,
  logoData,
}: {
  setOpen: (open: boolean) => void;
  setLogoData: (data: LogoImageList) => void;
  logoData: LogoImageList | null;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate, isPending } = useLogoFileUpload();
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
    formData.append("image", file);

    mutate(
      { image: formData, moduleName: "LD" },
      {
        onSuccess: (response) => {
          setFile(null);
          setLogoData(response.data);
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
          <FileUpload
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
        <LDModal
          logoData={logoData}
          onCloseModal={() => {
            setIsModalOpen(false);
            setLogoData({ message: "", data: [] });
          }}
        />
      )}
    </>
  );
};

export default LDUploadMediaModal;
