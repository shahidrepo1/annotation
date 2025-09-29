import DatePicker from "../../ui/DatePicker";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Modal from "../../ui/Modal";
import AdFolders from "./AdVideoFolders";
import { AdUploadMediaModal } from "./AdVideoUploadMediaModal";
import { AdGroup, AdSegmentsData } from "../../../api/useAdSegments.types";
import { AdFolderModal } from "./AdVideoFolderModal";
type AdUntrainedDataProps = {
  data: AdSegmentsData;
  onSelectionChange?: (selections: {
    files: Record<number, boolean>;
    folders: Array<number>;
  }) => void;
};

export const AdUntrainedData = ({
  data,
  onSelectionChange = () => {},
}: AdUntrainedDataProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate") ?? (null as string | null);
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate") ?? (null as string | null);
  const endDateDate = endDate ? new Date(endDate) : null;
  const [selectedSource, setSelectedSource] = useState("");
  const active = searchParams.get("active");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<AdGroup | null>(null);
  const [selectedFolders, setSelectedFolders] = useState<Array<number>>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, boolean>>(
    {}
  );

  const handleFolderClick = (folder: AdGroup) => {
    setSelectedFolder(folder);
    setIsModalOpen(true);
  };

  const handleFolderSelect = (folderIndex: number, isSelected: boolean) => {
    const folder = data.untrainedData[folderIndex];

    setSelectedFolders((prevFolders) => {
      const newFolders = isSelected
        ? [...prevFolders, folderIndex]
        : prevFolders.filter((id) => id !== folderIndex);

      const newFiles = { ...selectedFiles };
      if (folder) {
        folder.chunks.forEach((chunk) => {
          if (isSelected) {
            newFiles[chunk.id] = true;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete newFiles[chunk.id];
          }
        });
      }

      setSelectedFiles(newFiles);
      onSelectionChange({
        files: newFiles,
        folders: newFolders,
      });

      return newFolders;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allFolderIndices = data.untrainedData.map((_, i) => i);
      setSelectedFolders(allFolderIndices);

      const newSelectedFiles: Record<number, boolean> = {};
      data.untrainedData.forEach((folder) => {
        folder.chunks.forEach((chunk) => {
          newSelectedFiles[chunk.id] = true;
        });
      });

      setSelectedFiles(newSelectedFiles);

      onSelectionChange({
        files: newSelectedFiles,
        folders: allFolderIndices,
      });
    } else {
      setSelectedFolders([]);
      setSelectedFiles({});

      onSelectionChange({
        files: {},
        folders: [],
      });
    }
  };

  const handleFileSelectionChange = (fileId: number, isSelected: boolean) => {
    setSelectedFiles((prev) => {
      const newFiles = {
        ...prev,
        [fileId]: isSelected,
      };
      onSelectionChange({
        files: newFiles,
        folders: selectedFolders,
      });
      return newFiles;
    });
  };
  useEffect(() => {
    if (Object.keys(selectedFiles).length > 0 || selectedFolders.length > 0) {
      const noSelections =
        Object.keys(selectedFiles).length === 0 && selectedFolders.length === 0;

      if (noSelections) {
        setSelectedFolders([]);
        setSelectedFiles({});
      }
    }
  }, [onSelectionChange, selectedFiles, selectedFolders]);

  return (
    <>
      <div className="w-full space-x-3">
        {active === "UntrainedData" && (
          <div className="grid grid-cols-2 space-x-7">
            <DatePicker
              value={{ startDate: startDateDate, endDate: endDateDate }}
              onChange={(value) => {
                if (!value) return;
                if (!value.startDate && !value.endDate) {
                  setSearchParams((curr) => {
                    curr.delete("startDate");
                    curr.delete("endDate");
                    return curr;
                  });
                  return;
                }
                setSearchParams((curr) => {
                  curr.set(
                    "startDate",
                    value.startDate?.toISOString().slice(0, 10) ?? ""
                  );
                  curr.set(
                    "endDate",
                    value.endDate?.toISOString().slice(0, 10) ?? ""
                  );
                  return curr;
                });
              }}
              readOnly={true}
            />

            <select
              className="px-2 border border-gray-400 rounded-md outline-none text-gray-700 h-[38px]"
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
              }}
            >
              <option value="" disabled className="text-gray-400">
                Source
              </option>
              <option value="Upload">Upload</option>
              <option value="Application">Application</option>
            </select>
          </div>
        )}
        <div className={active === "UntrainedData" ? "mt-4" : ""}>
          <div className="flex items-center justify-between pb-4">
            <h1 className="font-bold text-xl p-3">Untrained Data</h1>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 text-sm cursor-pointer"
                checked={
                  data.untrainedData?.length > 0 &&
                  selectedFolders?.length === data.untrainedData?.length
                }
                onChange={(e) => {
                  handleSelectAll(e.target.checked);
                }}
              />
              <span>Select all</span>
            </div>
          </div>
        </div>

        <AdFolders
          data={data.untrainedData}
          onFolderClick={handleFolderClick}
          onFolderSelect={handleFolderSelect}
          selectedFolders={selectedFolders}
          isTrained={false}
          selectedFiles={selectedFiles}
        />

        {isUploadModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
              <AdUploadMediaModal
                onClose={() => {
                  setIsUploadModalOpen(false);
                }}
                onUploadSuccess={(data) => {
                  const transformed = {
                    label: data.message,
                    chunks: data.chunk.map((c) => ({
                      id: c.id,
                      timestamp: {
                        start: c.start_time,
                        end: c.end_time,
                      },
                      media_file: c.media_file_url,
                    })),
                  };
                  setSelectedFolder(transformed);
                  setIsUploadModalOpen(false);
                  setIsModalOpen(true);
                }}
              />
              <button
                className="absolute top-0 right-0 p-5"
                onClick={() => {
                  setIsUploadModalOpen(false);
                }}
              >
                <IoClose className="text-2xl" />
              </button>
            </div>
          </div>
        )}

        {isModalOpen && selectedFolder && (
          <Modal>
            <AdFolderModal
              onSave={() => {
                setIsModalOpen(false);
              }}
              onClose={() => {
                setIsModalOpen(false);
              }}
              adData={selectedFolder}
              selectedFiles={selectedFiles}
              onFileSelectionChange={handleFileSelectionChange}
              isTrained={false}
            />
          </Modal>
        )}
        {selectedSource === "Upload" && (
          <div className="flex justify-center mt-4">
            <button
              className="bg-indigo-700 text-white py-2 px-4 rounded"
              onClick={() => {
                setIsUploadModalOpen(true);
              }}
            >
              Upload Media
            </button>
          </div>
        )}
        {data.untrainedData.length === 0 && (
          <div className="text-center text-gray-500 mt-4 text-sm italic">
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default AdUntrainedData;
