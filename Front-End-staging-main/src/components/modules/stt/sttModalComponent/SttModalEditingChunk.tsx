import { FaCheck, FaEdit, FaTimes, FaTrashAlt } from "react-icons/fa";
import useSttChunkEdit from "../../../../api/useSttChunkEdit";
import { toast } from "react-toastify";
import { SttTranscription } from "../../../../api/useSttFileUpload.types";
import { useQueryClient } from "@tanstack/react-query";
import useDeleteSttChunk from "../../../../api/useDeleteSttChunk";
import axios from "axios";

type SttModalEditingChunkProps = {
  item: {
    id: number;
    uploaded_file: number;
    transcription: string;
  };
  editingId: number | null;
  editedText: Record<number, string>;
  setUpdateData: React.Dispatch<React.SetStateAction<SttTranscription>>;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  setData: (data: SttTranscription) => void;
  setEditedText: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  data: SttTranscription;
  setFolderName: React.Dispatch<React.SetStateAction<string>>;
  status: boolean;
};

export const SttModalEditingChunk = ({
  item,
  editingId,
  editedText,
  setUpdateData,
  setEditingId,
  setData,
  setEditedText,
  data,
  setFolderName,
  status,
}: SttModalEditingChunkProps) => {
  const { mutate } = useSttChunkEdit();
  const queryClient = useQueryClient();
  const { mutate: deleteChunk } = useDeleteSttChunk();

  const handleCheck = (chunkId: number, jobId: number) => {
    mutate(
      {
        job_id: jobId,
        chunk_id: chunkId,
        transcription: editedText[chunkId],
      },
      {
        onSuccess: () => {
          toast.success("Transcription Edited Successfully");
          setUpdateData((prev) => {
            const updatedChunks = prev.chunks.map((chunk) => {
              if (chunk.id === chunkId) {
                return { ...chunk, transcription: editedText[chunkId] };
              }
              return chunk;
            });
            return { ...prev, chunks: updatedChunks };
          });
          void queryClient.invalidateQueries({ queryKey: ["SttChunks"] });
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { message?: string };
            toast.error(err?.message || "Unable to Update Chunk.");
          } else {
            toast.error("Something went wrong.");
          }
        },
      }
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (chunkId: number, jobId: number) => {
    deleteChunk(
      { job_id: jobId, chunk_id: chunkId },
      {
        onSuccess: (response: { data: SttTranscription }) => {
          toast.success("Chunk deleted successfully");
          setData(response.data);
          setUpdateData((prevData) => {
            return {
              ...prevData,
              chunks: prevData.chunks.filter((chunk) => chunk.id !== chunkId),
            };
          });
          void queryClient.invalidateQueries({ queryKey: ["SttChunks"] });
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error)) {
            const err = error.response?.data as { message?: string };
            toast.error(err?.message || "Failed to delete chunk");
          } else {
            toast.error("Something went wrong.");
          }
        },
      }
    );
  };

  const handleEditClick = (id: number, text: string) => {
    setEditingId(id);
    setEditedText((prev) => ({ ...prev, [id]: text }));
    if (data.folderName !== undefined) {
      setFolderName(data.folderName);
    }
  };

  return (
    <div className="flex space-x-2 ml-4">
      {editingId === item.id ? (
        <>
          <button
            onClick={() => {
              handleCheck(item.id, item.uploaded_file);
            }}
            disabled={status}
            className={`text-green-600 ${
              status ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={status ? "Action disabled" : "Save changes"}
          >
            <FaCheck />
          </button>
          <button
            onClick={handleCancel}
            disabled={status}
            className={`text-red-600 ${
              status ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={status ? "Action disabled" : "Cancel editing"}
          >
            <FaTimes />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              handleEditClick(item.id, item.transcription);
            }}
            disabled={status}
            className={`text-black ${
              status ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={status ? "Action disabled" : "Edit"}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => {
              handleDelete(item.id, item.uploaded_file);
            }}
            disabled={status}
            className={`text-black ${
              status ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={status ? "Action disabled" : "Delete"}
          >
            <FaTrashAlt />
          </button>
        </>
      )}
    </div>
  );
};
