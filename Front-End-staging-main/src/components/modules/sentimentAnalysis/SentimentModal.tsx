import { SentimentData } from "../../../api/useSentimentResponse.types";
import { useState } from "react";
import { backendServiceUrl } from "../../../api/apiConstants";
import { FiDownload, FiTrash2 } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { SiGoogledocs } from "react-icons/si";
import { IoDocumentText } from "react-icons/io5";
import Select from "react-select";
import useGetSentimentLabels from "../../../api/useGetSentimentLabel";
import { toast } from "react-toastify";
import useSentimentUpdate from "../../../api/useSentimentUpdate";
import useSentimentDeleteLabel from "../../../api/useSentimentDeleteLabel";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  data: SentimentData;
  setIsModalOpen: (open: boolean) => void;
};

export const SentimentModal = ({ data, setIsModalOpen }: Props) => {
  const [isChecked, setIsChecked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  }>({
    value: data.data.sentiment,
    label: data.data.sentiment,
  });
  const queryClient = useQueryClient();
  const { data: labelsData, isLoading, isError } = useGetSentimentLabels();
  const { mutate } = useSentimentUpdate();
  const { mutate: deleteChunk } = useSentimentDeleteLabel();
  const fileUrl = data.data.media_file;
  const fileExtension = fileUrl?.split(".").pop()?.toLowerCase() || "";

  const getMediaType = (ext: string) => {
    if (["mp4", "webm", "ogg"].includes(ext)) return "videos";
    if (["mp3", "wav", "mpeg"].includes(ext)) return "audio";
    if (["pdf", "doc", "docx"].includes(ext)) return "texts";
    return "texts";
  };

  const mediaType = getMediaType(fileExtension);
  const mediaPath = `${backendServiceUrl}media/sentiment_media/${mediaType}/${fileUrl}`;

  const getFileIcon = () => {
    if (fileExtension === "pdf")
      return <FaFilePdf className="text-red-600" size={20} />;
    if (fileExtension === "docx")
      return <SiGoogledocs className="text-blue-500" size={20} />;
    if (fileExtension === "doc")
      return <IoDocumentText className="text-gray-600" size={20} />;
    return null;
  };

  const renderMediaContent = () => {
    if (!fileUrl) return null;

    if (mediaType === "videos") {
      return (
        <video controls className="w-full max-w-md rounded border shadow-sm">
          <source src={mediaPath} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (mediaType === "audio") {
      return (
        <audio controls className="w-full max-w-md rounded border shadow-sm">
          <source src={mediaPath} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      );
    }

    if (mediaType === "texts") {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            {getFileIcon()}
            <span className="truncate max-w-[250px]">{fileUrl}</span>
          </div>
          <a
            href={mediaPath}
            download
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
          >
            <FiDownload />
          </a>
        </div>
      );
    }

    return <p className="text-red-500">Unsupported file type</p>;
  };

  const handleSave = () => {
    if (!selectedOption?.value) {
      toast.error("Please select a sentiment label.");
      return;
    }

    const payload = {
      updates: [
        {
          analysis_id: data.data.analysis_id,
          label: selectedOption.value,
        },
      ],
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Sentiment updated successfully");
        setIsModalOpen(false);
      },
      onError: () => {
        toast.error("Something went wrong while updating sentiment");
      },
    });
  };

  const handleDelete = (analysis_id: number) => {
    deleteChunk(analysis_id, {
      onSuccess: () => {
        toast.success("Chunk deleted successfully");
        void queryClient.invalidateQueries({ queryKey: ["AdSegments"] });
        setIsModalOpen(true);
      },
      onError: () => {
        toast.error("Failed to delete chunk");
      },
    });
  };

  const options =
    labelsData?.labels.map((label) => ({
      value: label.label,
      label: label.label,
    })) || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative p-6 space-y-6 bg-white w-[900px] max-h-[90vh] overflow-auto rounded-xl shadow-lg border border-indigo-600">
        <div>
          {isLoading ? (
            <p>Loading labels...</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load labels.</p>
          ) : (
            <Select
              value={selectedOption}
              options={options}
              className="w-full"
              isSearchable
              placeholder="Select sentiment label"
              isClearable
              onChange={(option) => {
                if (option) setSelectedOption(option);
              }}
              maxMenuHeight={200}
              isDisabled={!isChecked}
            />
          )}
        </div>

        <div className="grid grid-cols-[40px_1fr_auto] gap-x-4 items-center border border-gray-200 p-5 rounded-lg shadow-sm">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {
              setIsChecked(!isChecked);
            }}
            className="cursor-pointer h-3 w-3 accent-indigo-600"
          />

          <div>{renderMediaContent()}</div>

          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-md text-white text-sm font-medium capitalize"
              style={{
                backgroundColor:
                  selectedOption?.value === "positive"
                    ? "#4ade80"
                    : selectedOption?.value === "negative"
                    ? "#EE5C5C"
                    : "#facc15",
              }}
            >
              {selectedOption?.value}
            </span>

            <button
              className="p-2 rounded hover:bg-gray-100 transition text-red-600"
              title="Delete"
              onClick={() => {
                handleDelete(data.data.analysis_id);
              }}
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={handleSave}
            // disabled={!selectedOption}
            className={`px-5 py-2 border rounded-lg flex items-center gap-2  bg-indigo-500 text-white hover:bg-indigo-600 `}
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false);
            }}
            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg bg-white hover:bg-indigo-600 hover:text-white flex items-center gap-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
