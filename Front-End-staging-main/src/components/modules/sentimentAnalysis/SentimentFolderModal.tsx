import { FiDownload, FiTrash2 } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { SiGoogledocs } from "react-icons/si";
import { IoDocumentText } from "react-icons/io5";
import { useState } from "react";
import Select from "react-select";
import { backendServiceUrl } from "../../../api/apiConstants";
import {
  SentimentEntry,
  SentimentGroup,
} from "../../../api/useGetSentiment.types";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import useSentimentUpdate from "../../../api/useSentimentUpdate";
import useSentimentDeleteLabel from "../../../api/useSentimentDeleteLabel";
import useGetSentimentLabels from "../../../api/useGetSentimentLabel";

type UnifiedSentimentEntry = SentimentEntry & {
  source: "document" | "audio" | "video";
};

type Props = {
  data: SentimentGroup;
  setIsModalOpen: (open: boolean) => void;
  selectAll: boolean;
  selectedChunkIds: Array<number>;
  setSelectedChunkIds: React.Dispatch<React.SetStateAction<Array<number>>>;
  mediaType: "all" | "audio" | "video" | "document";
  isTrained?: boolean;
};

export const SentimentAnalysisFolderModal = ({
  data,
  setIsModalOpen,
  selectedChunkIds,
  setSelectedChunkIds,
  mediaType,
  isTrained = false,
}: Props) => {
  // const [selectedChunkIds, setSelectedChunkIds] = useState<Array<number>>([]);
  // const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const { mutate: updateSentiments } = useSentimentUpdate();
  const { mutate: deleteSentiment } = useSentimentDeleteLabel();
  const { data: labelsData } = useGetSentimentLabels();
  const [labelUpdates, setLabelUpdates] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();
  const labelOptions =
    labelsData?.labels.map((label) => ({
      value: label.label,
      label: label.label,
    })) || [];

  const handleSave = () => {
    const updates = Object.entries(labelUpdates).map(([id, label]) => ({
      analysis_id: Number(id),
      label,
    }));

    if (updates.length === 0) {
      toast.warning("No label changes to save.");
      return;
    }

    updateSentiments(
      { updates },
      {
        onSuccess: () => {
          toast.success("Sentiments updated successfully");
          void queryClient.invalidateQueries({ queryKey: ["allSentiments"] });
          setIsModalOpen(false);
        },
        onError: () => {
          toast.error("Failed to update sentiments");
        },
      }
    );
  };

  const handleDelete = (analysis_id: number) => {
    deleteSentiment(analysis_id, {
      onSuccess: () => {
        toast.success("Entry deleted successfully");
        void queryClient.invalidateQueries({ queryKey: ["allSentiments"] });
      },
      onError: () => {
        toast.error("Failed to delete entry");
      },
    });
  };

  const mapToUnified = (): Array<UnifiedSentimentEntry> => {
    const all: Array<UnifiedSentimentEntry> = [];

    Object.entries(data).forEach(([, entries]) => {
      entries?.forEach((entry) => {
        const mediaType = entry.media_file.media_type;
        const source =
          mediaType === "text"
            ? "document"
            : mediaType === "audio"
            ? "audio"
            : "video";

        all.push({
          ...entry,
          source,
        });
      });
    });

    return all;
  };

  const allEntries = mapToUnified().filter((entry) =>
    mediaType === "all" ? true : entry.source === mediaType
  );

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-red-600" size={20} />;
    if (ext === "docx")
      return <SiGoogledocs className="text-blue-500" size={20} />;
    if (ext === "doc")
      return <IoDocumentText className="text-gray-600" size={20} />;
    return null;
  };

  const renderMedia = (entry: UnifiedSentimentEntry) => {
    const ext =
      entry.media_file.media_file.split(".").pop()?.toLowerCase() || "";
    const cleanedPath = entry.media_file.media_file.replace(/^\/+/, "");
    const path = `${backendServiceUrl}${cleanedPath}`;

    if (entry.media_file.media_type === "video") {
      return (
        <video controls className="w-full max-w-md rounded border shadow-sm">
          <source src={path} type={`video/${ext}`} />
        </video>
      );
    }

    if (entry.media_file.media_type === "audio") {
      return (
        <audio controls className="w-full max-w-md rounded border shadow-sm">
          <source src={path} type={`audio/${ext}`} />
        </audio>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          {getFileIcon(entry.media_file.name)}
          <span className="truncate max-w-[250px]">
            {entry.media_file.name}
          </span>
        </div>
        <a
          href={path}
          download
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
        >
          <FiDownload />
        </a>
      </div>
    );
  };

  const sentimentColors = {
    positive: "#4ade80",
    negative: "#EE5C5C",
    neutral: "#facc15",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative p-6 pb-0 bg-white w-[1000px] max-h-[90vh] overflow-auto rounded-xl shadow-lg border border-indigo-600 space-y-4">
        <div className="mb-4">
          <Select
            value={null}
            options={labelOptions}
            onChange={(option) => {
              if (option && selectedChunkIds.length > 0) {
                const lastSelectedId =
                  selectedChunkIds[selectedChunkIds.length - 1];
                setLabelUpdates((prev) => ({
                  ...prev,
                  [lastSelectedId]: option.value,
                }));
              }
            }}
            isClearable
            isSearchable
            placeholder={
              selectedChunkIds.length === 0
                ? "Select at least one entry"
                : "Apply label to selected"
            }
            isDisabled={selectedChunkIds.length === 0}
          />
        </div>

        {allEntries.length === 0 ? (
          <div className="text-center text-gray-500 font-medium py-10">
            No data found
          </div>
        ) : (
          allEntries.map((entry) => {
            return (
              <div
                key={entry.id}
                className="grid grid-cols-[40px_1fr_auto] items-center gap-5 border p-4 rounded"
              >
                <input
                  type="checkbox"
                  className="h-3 w-3 cursor-pointer accent-indigo-600"
                  checked={selectedChunkIds.includes(entry.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChunkIds((prev) => [...prev, entry.id]);
                    } else {
                      setSelectedChunkIds((prev) =>
                        prev.filter((id) => id !== entry.id)
                      );
                    }
                  }}
                />

                <div>{renderMedia(entry)}</div>

                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1.5 rounded-md text-white text-sm font-medium capitalize"
                    style={{
                      backgroundColor:
                        sentimentColors[
                          (labelUpdates[entry.id] ||
                            entry.sentiment
                              .label) as keyof typeof sentimentColors
                        ] || "#cccccc",
                    }}
                  >
                    {labelUpdates[entry.id] || entry.sentiment.label}
                  </span>
                  <button
                    onClick={() => {
                      if (!isTrained) {
                        handleDelete(entry.id);
                      }
                    }}
                    disabled={isTrained}
                    className={`p-2 rounded transition ${
                      isTrained
                        ? "text-gray-400 cursor-not-allowed "
                        : "hover:bg-gray-100 text-red-600"
                    }`}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {
          <div className="flex justify-center gap-2 p-4 sticky bottom-0 bg-white">
            <button
              onClick={handleSave}
              className="px-5 py-2 border rounded-lg flex items-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white"
            >
              Cancel
            </button>
          </div>
        }
      </div>
    </div>
  );
};
