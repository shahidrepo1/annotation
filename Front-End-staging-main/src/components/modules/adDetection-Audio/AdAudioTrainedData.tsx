import { useState } from "react";
import { DataType, LabelGroup } from "../../../api/useGetAdAudio.types";
import AdAudioFolders from "./AdAudioFolders";
import Modal from "../../ui/Modal";
import { AdAudioFolderModal } from "./AdAudioFolderModal";

export const AdAudioTrainedData = ({
  data,
  onSelectionChange = () => {},
}: {
  data: DataType;
  onSelectionChange?: (selections: {
    files: Record<number, boolean>;
    folders: Array<number>;
  }) => void;
}) => {
  const [selectedFolders, setSelectedFolders] = useState<Array<number>>([]);
  const [selectedFolder, setSelectedFolder] = useState<LabelGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, boolean>>(
    {}
  );

  const handleFolderClick = (folder: LabelGroup) => {
    setSelectedFolder(folder);
    setIsModalOpen(true);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allFolderIds = data.trainedData.map((f) => f.chunks[0].id);
      const newSelectedFiles: Record<number, boolean> = {};

      data.trainedData.forEach((folder) => {
        folder.chunks.forEach((chunk) => {
          newSelectedFiles[chunk.id] = true;
        });
      });

      setSelectedFolders(allFolderIds);
      setSelectedFiles(newSelectedFiles);
      onSelectionChange({
        files: newSelectedFiles,
        folders: allFolderIds,
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

  const handleFolderSelect = (folderId: number, isSelected: boolean) => {
    const folder = data.trainedData.find((f) => f.chunks[0].id === folderId);

    const newFolders = isSelected
      ? [...selectedFolders, folderId]
      : selectedFolders.filter((id) => id !== folderId);

    setSelectedFolders(newFolders);

    setSelectedFiles((prev) => {
      const newFiles = { ...prev };

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
      onSelectionChange({
        files: newFiles,
        folders: newFolders,
      });

      return newFiles;
    });
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
      <AdAudioFolders
        data={data.trainedData}
        onFolderClick={handleFolderClick}
        onFolderSelect={handleFolderSelect}
        selectedFolders={selectedFolders}
        isTrained={true}
        selectedFiles={selectedFiles}
      />

      {isModalOpen && selectedFolder && (
        <Modal>
          <AdAudioFolderModal
            onSave={() => {
              setIsModalOpen(false);
            }}
            onClose={() => {
              setIsModalOpen(false);
            }}
            adData={selectedFolder}
            selectedFiles={selectedFiles}
            onFileSelectionChange={handleFileSelectionChange}
            isTrained={true}
          />
        </Modal>
      )}
      {data.trainedData.length === 0 && (
        <div className="text-center text-gray-500 mt-4 text-sm italic">
          No data found{" "}
        </div>
      )}
    </div>
  );
};

export default AdAudioTrainedData;
