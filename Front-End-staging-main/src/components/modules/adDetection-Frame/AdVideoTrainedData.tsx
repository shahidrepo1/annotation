import Modal from "../../ui/Modal";
import { useEffect, useState } from "react";
import AdFolders from "./AdVideoFolders";
import { AdGroup, AdSegmentsData } from "../../../api/useAdSegments.types";
import { AdFolderModal } from "./AdVideoFolderModal";

export const AdTrainedData = ({
  data,
  onSelectionChange = () => {},
}: {
  data: AdSegmentsData;
  onSelectionChange?: (selections: {
    files: Record<number, boolean>;
    folders: Array<number>;
  }) => void;
}) => {
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
    const folder = data.trainedData[folderIndex];

    const newFolders = isSelected
      ? [...selectedFolders, folderIndex]
      : selectedFolders.filter((id) => id !== folderIndex);

    setSelectedFolders(newFolders);

    setSelectedFiles((prev) => {
      const newFiles = { ...prev };
      folder.chunks.forEach((chunk) => {
        if (isSelected) {
          newFiles[chunk.id] = true;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete newFiles[chunk.id];
        }
      });

      onSelectionChange({
        files: newFiles,
        folders: newFolders,
      });

      return newFiles;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allFolderIndices = data.trainedData.map((_, i) => i);
      setSelectedFolders(allFolderIndices);

      const newSelectedFiles: Record<number, boolean> = {};
      data.trainedData.forEach((folder) => {
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
  }, [data, onSelectionChange, selectedFiles, selectedFolders]);

  return (
    <div className="w-full space-x-3">
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-bold text-xl p-3">Trained Data</h1>
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 text-sm cursor-pointer"
            checked={
              data.trainedData.length > 0 &&
              selectedFolders.length === data.trainedData.length
            }
            onChange={(e) => {
              handleSelectAll(e.target.checked);
            }}
          />
          <span>Select all</span>
        </div>
      </div>
      <AdFolders
        data={data.trainedData}
        onFolderClick={handleFolderClick}
        onFolderSelect={handleFolderSelect}
        selectedFolders={selectedFolders}
        selectedFiles={selectedFiles}
        isTrained={true}
      />

      {isModalOpen && selectedFolder && (
        <Modal>
          <AdFolderModal
            onClose={() => {
              setIsModalOpen(false);
            }}
            adData={selectedFolder}
            onSave={() => {
              setIsModalOpen(false);
            }}
            selectedFiles={selectedFiles}
            onFileSelectionChange={handleFileSelectionChange}
            isTrained={true}
          />
        </Modal>
      )}
      {data.trainedData.length === 0 && (
        <div className="text-center text-gray-500 mt-4 text-sm italic">
          No data found
        </div>
      )}
    </div>
  );
};

export default AdTrainedData;
