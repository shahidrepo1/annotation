import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "../../../ui/ConfirmDialog";
import { toast } from "react-toastify";
import useClassifyChunks from "../../../../api/useClassifySttChunks";
import { SttTranscription } from "../../../../api/useSttFileUpload.types";
import axios from "axios";

type ClassifyChunksResponse = {
  data: SttTranscription & {
    folderName: string;
  };
};
type SttModalButtonsProps = {
  showConfirm: boolean;
  setShowConfirm: (showConfirm: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  folderName: string;
  setData: (data: SttTranscription) => void;
  addFolder: (folderName: string) => void;
  setFolderName: (folderName: string) => void;
  filteredChunks: SttTranscription["chunks"];
  setUploadModalOpen: (val: boolean) => void;
};
export const SttModalButtons = ({
  showConfirm,
  setShowConfirm,
  setIsModalOpen,
  folderName,
  setData,
  addFolder,
  setFolderName,
  filteredChunks,
  setUploadModalOpen,
}: SttModalButtonsProps) => {
  const queryClient = useQueryClient();
  const { mutate: classifyChunks } = useClassifyChunks();

  const handleConfirmClose = () => {
    setShowConfirm(false);
    setIsModalOpen(false);
    void queryClient.invalidateQueries({ queryKey: ["SttChunks"] });
  };

  const handleSave = () => {
    const chunkIds = filteredChunks.map((item) => item.id);

    if (chunkIds.length === 0) {
      toast.error("No chunks to save.");
      return;
    }

    classifyChunks(
      { chunk_ids: chunkIds },
      {
        onSuccess: (response: ClassifyChunksResponse) => {
          try {
            toast.success("Folder Updated Successfully");
            const responseData = response.data;

            if (folderName && responseData.folderName === folderName) {
              setData(responseData);
            } else {
              setData(responseData);
              setFolderName(responseData.folderName);
              addFolder(responseData.folderName);
            }

            void queryClient.invalidateQueries({ queryKey: ["sttFileUpload"] });
            void queryClient.invalidateQueries({ queryKey: ["approveData"] });
            void queryClient.invalidateQueries({ queryKey: ["SttChunks"] });

            // Close modals in sequence
            setIsModalOpen(false);
            setTimeout(() => setUploadModalOpen(false), 100);
          } catch (error) {
            console.error("Error in success handler:", error);
          }
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { message?: string };
            toast.error(err?.message || "Chunks not found.");
          } else {
            toast.error("Something went wrong.");
          }
        },
      }
    );
  };

  return (
    <>
      <div className="flex justify-center space-x-4 pt-4">
        <button
          className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white border border-indigo-500"
          onClick={() => {
            setShowConfirm(true);
          }}
        >
          Close
        </button>

        {showConfirm && (
          <ConfirmDialog
            message="Are you sure you want to close the modal?"
            onConfirm={handleConfirmClose}
            onCancel={() => {
              setShowConfirm(false);
            }}
          />
        )}

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={() => {
            handleSave();
          }}
        >
          Save
        </button>
      </div>
    </>
  );
};
