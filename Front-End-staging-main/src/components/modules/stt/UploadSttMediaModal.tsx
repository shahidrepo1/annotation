import { useState } from "react";
import useSttUploadFile from "../../../api/useSttFileUpload";
import FileUpload from "../speakerRecognition/FileUpload";
import Button from "../../ui/Button";
import { toast } from "react-toastify";
import Modal from "../../ui/Modal";
import { SttModal } from "./SttModal";
import { SttTranscription } from "../../../api/useSttFileUpload.types";
// import SttFolders from "./SttFolders";
// import useApproveSttData from "../../../api/useApproveSttData";
import axios from "axios";
import useGetSttChunks from "../../../api/useGetSttChunks";
import { useQueryClient } from "@tanstack/react-query";

export const UploadSttMediaModal = ({
  setOpen,
  setData,
  data,
}: {
  setOpen: (open: boolean) => void;
  setData: (data: SttTranscription) => void;
  data: SttTranscription;
}) => {
  const { mutate, isPending, isError, error } = useSttUploadFile();
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setFolders] = useState<Array<string>>([]);
  // const [, setSelectedFolder] = useState<string | null>(null);
  // const { mutate: approveSttData } = useApproveSttData();
  const { refetch } = useGetSttChunks();
  const queryClient = useQueryClient();
  const [, setStatus] = useState(false);

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(
      { formData, moduleName: "STT" },

      {
        onSuccess: (data) => {
          setData(data);
          setFile(null);
          void refetch();
          void queryClient.invalidateQueries({ queryKey: ["approveData"] });
          toast.success("File uploaded successfully!");
          setIsModalOpen(true);
          setStatus(true);
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { message?: string };
            toast.error(err?.message || "Upload failed. Please try again.");
          } else {
            toast.error("Something went wrong during upload.");
          }
        },
      }
    );
  };

  const addFolder = (folderName: string) => {
    setFolders((prevFolders) => [...prevFolders, folderName]);
  };

  // const handleApproveSttData = () => {
  //   // @ts-expect-error: prevData has a type mismatch, but it's handled correctly.
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  //   const uploadedFileId = data.data[0].uploaded_file;
  //   if (!uploadedFileId) {
  //     toast.error("No valid ID found.");
  //     return;
  //   }
  //   if (typeof uploadedFileId !== "number") {
  //     toast.error("uploadedFileId is not a number");
  //     return;
  //   }
  //   approveSttData(uploadedFileId, {
  //     onSuccess: () => {
  //       toast.success("Data approved successfully!");
  //       void refetch();
  //       void queryClient.invalidateQueries({ queryKey: ["approveData"] });
  //       setIsModalOpen(false);
  //       setOpen(false);
  //     },
  //     onError: (error: unknown) => {
  //       if (axios.isAxiosError(error)) {
  //         const err = error.response?.data as { message?: string };
  //         toast.error(
  //           err?.message || "Unable to approve SR Data. Please try again."
  //         );
  //       } else {
  //         toast.error("Something went wrong.");
  //       }
  //     },
  //   });
  // };
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
      {/* <SttFolders
        folders={folders}
        onFolderClick={(folder) => {
          setSelectedFolder(folder);
          setData({ ...data });
          setIsModalOpen(true);
          setStatus(false);
        }}
        folderDataMap={{}}
        selectedFolders={{}}
        onCheckboxChange={() => {}}
        status={false}
      /> */}

      {/* {folders.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleApproveSttData}>Approve</Button>
        </div>
      )} */}

      {isModalOpen && (
        <Modal>
          <SttModal
            data={data}
            setIsModalOpen={setIsModalOpen}
            addFolder={addFolder}
            setData={setData}
            status={false}
            setUploadModalOpen={setOpen}
          />
        </Modal>
      )}
    </>
  );
};
