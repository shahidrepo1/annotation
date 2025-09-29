import { useEffect, useState } from "react";
import { AllAudioData } from "../../../api/useGetAllAudioChunks.types";
import { Folders } from "./Folders";
import { UploadMediaModal } from "./UploadMediaModal";
import { IoClose } from "react-icons/io5";
import DateRangePicker from "../../ui/DatePicker";
import type { DateValueType } from "react-tailwindcss-datepicker";
import { useSearchParams } from "react-router-dom";
import Modal from "../../ui/Modal";
import ModalContent from "./ModalContent";
import useGetTrainedPersons from "../../../api/useGetTrainedPersons";
import { toast } from "react-toastify";
import useUpdateSpeaker from "../../../api/useUpdateSpeaker";
import useGetAudioChunks from "../../../api/useGetAudioChunks";
import { status } from "./SrTabs";
import useUntrainedAudioStore from "../../../hooks/useUntrainedAudioStore";

type OptionType = { value: string; label: string };
export const UntrainedData = ({
  data,
  status,
}: {
  data: AllAudioData;
  status: status;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: untrainedPersons } = useGetTrainedPersons();
  const [isAddingUntrinedPerson, setIsAddingUntrinedPerson] = useState(false);
  const [newPerson, setNewPerson] = useState("");
  const [filesCount, setFilesCount] = useState<Array<string>>([]);
  const [, setHasUploaded] = useState(false);
  const [audioData, setAudioData] = useState<
    Record<string, Array<{ id: number; name: string }>>
  >({});
  const [isAddingNew] = useState(false);
  const [chunksId] = useState<number>(0);
  const [, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const {
    isError: isErrorUpdating,
    error: errorUpdate,
    mutate: updateSpeaker,
  } = useUpdateSpeaker();
  const { mutate: getAudioChunks } = useGetAudioChunks();
  const active = searchParams.get("active");
  const {
    untrainedSelectedFolders,
    setUntrainedSelectedFolders,
    setUntrainedSelectedAudios,
    setUntrainedSelectedAudioIds,
    clearSelections,
  } = useUntrainedAudioStore();
  useEffect(() => {
    setUntrainedSelectedAudios(audioData);
  }, [audioData, setUntrainedSelectedAudios]);

  const handleFolderClick = (
    speaker: string,
    chunks: Array<{ id: number; name: string }> | undefined
  ) => {
    setSelectedFolder(speaker);
    setAudioData((prev) => ({ ...prev, [speaker]: chunks ?? [] }));
    setIsModalOpen(true);
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
      toast.info("Please select person first");
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
            data: Record<string, Array<{ id: number; name: string }>>;
          }) => {
            setAudioData(response.data);
            setOpen(false);
          },
        });
      },
    });
  }
  const handleCheckboxChange = (speaker: string, chunkIds: Array<number>) => {
    setUntrainedSelectedFolders({
      ...untrainedSelectedFolders,
      [speaker]: chunkIds,
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const allSelected = data.noneTrainedData.reduce(
        (acc: { [key: string]: Array<number> }, folder) => {
          acc[folder.speaker] = folder.chunks.map((chunk) => chunk.id);
          return acc;
        },
        {}
      );
      const allAudioIds = data.noneTrainedData.flatMap((folder) =>
        folder.chunks.map((chunk) => chunk.id)
      );

      setUntrainedSelectedFolders(allSelected);
      setUntrainedSelectedAudioIds(allAudioIds);
    } else {
      if (data.noneTrainedData.length === 0) {
        setUntrainedSelectedFolders({});
      } else {
        clearSelections();
      }
    }
  };

  function handleDateChange(value: DateValueType) {
    setSearchParams((currentParams) => {
      if (value === null) {
        currentParams.delete("startDate");
        currentParams.delete("endDate");
      } else {
        const { startDate, endDate } = value;

        if (startDate) {
          currentParams.set("startDate", startDate.toISOString());
        } else {
          currentParams.delete("startDate");
        }

        if (endDate) {
          currentParams.set("endDate", endDate.toISOString());
        } else {
          currentParams.delete("endDate");
        }
      }

      return currentParams;
    });
  }

  return (
    <div className="w-full space-x-3">
      {active === "UntrainedData" && (
        <div className="grid grid-cols-2 space-x-7">
          <div>
            <DateRangePicker
              value={{
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
              }}
              onChange={handleDateChange}
              placeholder="Select Date Range"
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

      <div className={active === "UntrainedData" ? "mt-4" : ""}>
        <div className="flex items-center justify-between pb-4">
          <h1 className="font-bold text-xl p-3">Untrained Data</h1>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 text-sm cursor-pointer"
              checked={
                data?.noneTrainedData?.length > 0 &&
                data.noneTrainedData.every(
                  (folder) =>
                    untrainedSelectedFolders[folder.speaker]?.length ===
                    folder.chunks.length
                )
              }
              onChange={(e) => {
                handleSelectAllChange(e.target.checked);
              }}
            />
            <span>Select all</span>
          </div>
        </div>
        <Folders
          data={data.noneTrainedData}
          onFolderClick={handleFolderClick}
          filesCount={filesCount}
          selectedFolders={untrainedSelectedFolders}
          onCheckboxChange={handleCheckboxChange}
          status="untrained"
        />
        {data.noneTrainedData.length === 0 && (
          <div className="text-center text-gray-500 mt-4 text-sm italic">
            No data found
          </div>
        )}
      </div>

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

      {isModalOpen && selectedFolder && (
        <Modal>
          <ModalContent
            status={status}
            audioData={audioData}
            selectedFolder={selectedFolder}
            setAudioData={setAudioData}
            onClose={() => {
              setIsModalOpen(false);
            }}
            onSubmit={handleSubmit}
            dataId={chunksId}
            isAddingNew={isAddingUntrinedPerson}
            newPerson={newPerson}
            setNewPerson={setNewPerson}
            setIsAddingNew={setIsAddingUntrinedPerson}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            // @ts-expect-error: data is an array of strings, but the component expects a different type
            data={untrainedPersons}
            error={isErrorUpdating ? errorUpdate?.message : null}
            // @ts-expect-error: setFilesCount has a type mismatch, but it's handled correctly
            setFilesCount={setFilesCount}
            updateSelectedFolders={handleCheckboxChange}
          />
        </Modal>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
            <UploadMediaModal
              setIsUploadModalOpen={setIsUploadModalOpen}
              onUploadSuccess={() => {
                setHasUploaded(true);
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
    </div>
  );
};
