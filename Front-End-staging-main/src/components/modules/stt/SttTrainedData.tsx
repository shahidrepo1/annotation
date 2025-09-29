import { useMemo, useState } from "react";
import useGetSttChunks from "../../../api/useGetSttChunks";
import SttFolders from "./SttFolders";
import { SttModal } from "./SttModal";
import { SttTranscription } from "../../../api/useSttFileUpload.types";
import useSttSelectionStore from "../../../hooks/useSttSelectionStore";
type ChunkItem = {
  id: number;
  chunk_name: string;
  transcription: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  uploaded_file: number;
  is_trained: boolean;
};

type FolderChunk = {
  folderName: string;
  data: Array<ChunkItem>;
};

export const SttTrainedData = () => {
  const [, setSelectedFolder] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<SttTranscription | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: sttChunks } = useGetSttChunks();
  const {
    trainedSelectedFolders,
    setTrainedSelectedFolders,
    setselectedAudioIds,
    clearTrainedSelections,
  } = useSttSelectionStore();

  const folders: Array<FolderChunk> = useMemo(() => {
    if (!sttChunks) return [];

    const rawFolders = Array.isArray(sttChunks)
      ? sttChunks
      : [
          {
            folderName: sttChunks.folderName ?? "Default Folder",
            data: sttChunks.chunks,
          },
        ];

    return rawFolders
      .map((chunk: FolderChunk) => ({
        folderName: chunk.folderName,
        data: chunk.data.filter((item) => item.is_trained && !item.is_deleted),
      }))
      .filter((folder) => folder.data.length > 0);
  }, [sttChunks]);

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    const folderData =
      folders.find((f) => f.folderName === folderName)?.data || [];
    setSelectedData({ chunks: folderData });
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (
    folderName: string,
    chunkIds: Array<number>
  ) => {
    if (chunkIds.length === 0) {
      const updated = { ...trainedSelectedFolders };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete updated[folderName];
      setTrainedSelectedFolders(updated);
      setselectedAudioIds((prev) =>
        prev.filter((id) => !folderDataMap[folderName].includes(id))
      );
    } else {
      setTrainedSelectedFolders({
        ...trainedSelectedFolders,
        [folderName]: chunkIds,
      });
      setselectedAudioIds((prev) => {
        const newIds = folderDataMap[folderName].filter(
          (id) => !prev.includes(id)
        );
        return [...prev, ...newIds];
      });
    }
  };

  const folderDataMap = useMemo(() => {
    const map: Record<string, Array<number>> = {};
    folders.forEach((folder) => {
      const nonDeletedChunks = folder.data.filter(
        (chunk) => !chunk.is_deleted && chunk.is_trained
      );
      map[folder.folderName] = nonDeletedChunks.map((chunk) => chunk.id);
    });
    return map;
  }, [folders]);

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const allSelected = folders.reduce(
        (acc: Record<string, Array<number>>, folder) => {
          acc[folder.folderName] = folderDataMap[folder.folderName];
          return acc;
        },
        {}
      );
      setTrainedSelectedFolders(allSelected);
      const allAudioIds = folders.flatMap(
        (folder) => folderDataMap[folder.folderName]
      );
      setselectedAudioIds(allAudioIds);
    } else {
      clearTrainedSelections();
      setselectedAudioIds([]);
    }
  };

  return (
    <div className="w-full space-x-3">
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-bold text-xl p-3">Trained Data</h1>
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 text-sm cursor-pointer"
            onChange={(e) => {
              handleSelectAllChange(e.target.checked);
            }}
          />
          <span>Select all</span>
        </div>
      </div>
      <SttFolders
        folders={folders.map((folder) => folder.folderName)}
        onFolderClick={handleFolderClick}
        folderDataMap={folderDataMap}
        selectedFolders={trainedSelectedFolders}
        onCheckboxChange={handleCheckboxChange}
        status={true}
      />

      {isModalOpen && selectedData && (
        <SttModal
          data={selectedData}
          setIsModalOpen={setIsModalOpen}
          addFolder={() => {}}
          setData={setSelectedData}
          status={true}
          setUploadModalOpen={() => {}}
        />
      )}
    </div>
  );
};

export default SttTrainedData;
