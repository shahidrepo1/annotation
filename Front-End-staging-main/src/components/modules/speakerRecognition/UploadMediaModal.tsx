import { useState } from "react";
import useSrUploadFile from "../../../api/useSrFileUpload";
import Modal from "../../ui/Modal";
import useGetTrainedPersons from "../../../api/useGetTrainedPersons";
import useUpdateSpeaker from "../../../api/useUpdateSpeaker";
import { toast } from "react-toastify";
import useGetAudioChunks from "../../../api/useGetAudioChunks";
import ModalContent from "./ModalContent";
import FileUpload from "./FileUpload";
import FolderList from "./FolderList";
import Button from "../../ui/Button";
import useApproveSrData from "../../../api/useApproveSrData";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const UploadMediaModal = ({
  setIsUploadModalOpen,
  onUploadSuccess,
}: {
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onUploadSuccess: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPerson, setNewPerson] = useState("");
  const [audioData, setAudioData] = useState<
    Record<string, [{ id: number; name: string }]>
  >({});
  type OptionType = { value: string; label: string };
  const [chunksId, setChunksId] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

  const { mutate: approveSrData } = useApproveSrData();
  const {
    mutate: updateSpeaker,
    isError: isErrorUpdating,
    error: errorUpdate,
  } = useUpdateSpeaker();
  const { data } = useGetTrainedPersons();
  const { mutate: getAudioChunks } = useGetAudioChunks();
  const { mutate, isPending, isError, error } = useSrUploadFile();
  const queryClient = useQueryClient();

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(
      { formData, moduleName: "SR" },

      {
        onSuccess: (response: {
          data: {
            id: number;
            data: Record<string, [{ id: number; name: string }]>;
          };
        }) => {
          setFile(null);
          setChunksId(Number(response.data.id));
          setAudioData(
            response.data.data as Record<string, [{ id: number; name: string }]>
          );
          setOpen(false);
          onUploadSuccess();
          toast.success("File uploaded successfully!");
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError<Record<string, string>>(error)) {
            const err = error.response?.data?.message;
            toast.error(err ?? "Upload failed. Please try again.");
          }
        },
      }
    );
  };
  function handleSubmit() {
    const data = {
      oldSpeaker: selectedFolder ? selectedFolder : "",
      newSpeaker: isAddingNew ? newPerson || "" : selectedOption?.label || "",
      file: selectedFolder
        ? audioData[selectedFolder].map((item) => item.name)
        : [],
    };
    if (!data.newSpeaker) {
      alert("Please select person first");
      return;
    }

    updateSpeaker(data, {
      onSuccess: () => {
        toast.success("Speaker updated successfully!");
        const data = {
          fileId: chunksId,
        };
        getAudioChunks(data, {
          onSuccess: (response: {
            data: { data: Record<string, [{ id: number; name: string }]> };
          }) => {
            setAudioData(
              response.data.data as Record<
                string,
                [{ id: number; name: string }]
              >
            );
            setOpen(false);
          },
        });
      },
    });
  }
  const handleApproveSrData = () => {
    approveSrData(
      { id: chunksId },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["allAudioChunks"] });
          toast.success("Sr data approved successfully!");
          setAudioData({});
          setIsUploadModalOpen(false);
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { message?: string };
            toast.error(
              err?.message || "Unable to Approve SR Data. Please try again."
            );
          } else {
            toast.error("Something went wrong.");
          }
        },
      }
    );
  };

  return (
    <>
      {open && selectedFolder && (
        <Modal>
          <ModalContent
            audioData={audioData}
            selectedFolder={selectedFolder}
            isAddingNew={isAddingNew}
            newPerson={newPerson}
            setNewPerson={setNewPerson}
            setIsAddingNew={setIsAddingNew}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            // @ts-expect-error data is an array of strings, but the component expects a different type
            data={data}
            onClose={() => {
              setOpen(false);
            }}
            onSubmit={handleSubmit}
            error={isErrorUpdating ? errorUpdate?.message : null}
            setAudioData={setAudioData}
            dataId={chunksId}
            status="untrained"
            setFilesCount={() => {}}
            updateSelectedFolders={() => {}}
          />
        </Modal>
      )}

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

      <FolderList
        folders={audioData ? Object.keys(audioData) : []}
        onSelectFolder={(folder) => {
          setSelectedFolder(folder);
          setOpen(true);
        }}
      />
      {Object.keys(audioData).length > 0 && (
        <div className="mt-6 flex justify-center" onClick={handleApproveSrData}>
          <Button>Approve</Button>
        </div>
      )}
    </>
  );
};
