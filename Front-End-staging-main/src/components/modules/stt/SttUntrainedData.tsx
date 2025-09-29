import Datepicker from "react-tailwindcss-datepicker";
import { useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { UploadSttMediaModal } from "./UploadSttMediaModal";
import { SttTranscription } from "../../../api/useSttFileUpload.types";
import SttFolders from "./SttFolders";
import useGetSttChunks from "../../../api/useGetSttChunks";
import { SttModal } from "./SttModal";
import useSttSelectionStore from "../../../hooks/useSttSelectionStore";
type SttFolderData = {
  folderName: string;
  data: SttTranscription["chunks"];
};
export const SttUntrainedData = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate") ?? (null as string | null);
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate") ?? (null as string | null);
  const endDateDate = endDate ? new Date(endDate) : null;
  const [selectedSource, setSelectedSource] = useState("");
  const active = searchParams.get("active");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [data, setData] = useState<SttTranscription>({
    chunks: [],
  });
  const { data: sttChunks } = useGetSttChunks();
  const [, setSelectedFolder] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<SttTranscription | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    untrainedSelectedFolders,
    setUntrainedSelectedFolders,
    setselectedAudioIds,
    clearUntrainedSelections,
  } = useSttSelectionStore();

  const folders: Array<SttFolderData> = useMemo(() => {
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
      .map((chunk: SttFolderData) => ({
        folderName: chunk.folderName,
        data: chunk.data.filter((item) => !item.is_trained && !item.is_deleted),
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
      const updated = { ...untrainedSelectedFolders };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete updated[folderName];
      setUntrainedSelectedFolders(updated);
      setselectedAudioIds((prev) =>
        prev.filter((id) => !folderDataMap[folderName].includes(id))
      );
    } else {
      setUntrainedSelectedFolders({
        ...untrainedSelectedFolders,
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
        (chunk) => !chunk.is_deleted && !chunk.is_trained
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
      setUntrainedSelectedFolders(allSelected);
      const allAudioIds = folders.flatMap(
        (folder) => folderDataMap[folder.folderName]
      );
      setselectedAudioIds(allAudioIds);
    } else {
      clearUntrainedSelections();
      setselectedAudioIds([]);
      setUntrainedSelectedFolders({});
    }
  };

  return (
    <>
      <div className="w-full space-x-3">
        {active === "sttUntrainedData" && (
          <div className="grid grid-cols-2 space-x-7">
            <div>
              <Datepicker
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
                inputClassName={twMerge(
                  "text-gray-700 w-full rounded-md border border-gray-400 overflow-hidden px-2 text-sm focus:outline-none",
                  "h-[38px]"
                )}
                readOnly={true}
              />
            </div>

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
        <div className={active === "sttUntrainedData" ? "mt-4" : ""}>
          <div className="flex items-center justify-between pb-4">
            <h1 className="font-bold text-xl p-3">Untrained Data</h1>
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
        </div>

        <SttFolders
          folders={folders.map((folder: SttFolderData) => folder.folderName)}
          onFolderClick={handleFolderClick}
          folderDataMap={folderDataMap}
          onCheckboxChange={handleCheckboxChange}
          selectedFolders={untrainedSelectedFolders}
          status={false}
        />
        {folders.length === 0 && (
          <div className="text-center text-gray-500 mt-4 text-sm italic">
            No data found
          </div>
        )}

        {isUploadModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
              <UploadSttMediaModal
                setOpen={setIsUploadModalOpen}
                setData={setData}
                data={data}
                // onClose={() => {}}
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

        {isModalOpen && selectedData && (
          <SttModal
            data={selectedData}
            setIsModalOpen={setIsModalOpen}
            addFolder={() => {}}
            setData={setSelectedData}
            status={false}
            setUploadModalOpen={() => {}}
          />
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
      </div>
    </>
  );
};

export default SttUntrainedData;
