import { FaFolder } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import axios from "axios";

type ModalContainerHeader = {
  isAddingNew: boolean;
  newPerson: string;
  setIsAddingNew: (value: boolean) => void;
  setNewPerson: (value: string) => void;
  selectedOption: OptionType | null;
  setSelectedOption: (option: OptionType | null) => void;
  setShowSaveCancel: (value: boolean) => void;
  status: string;
  addPerson: (data: { labelName: string }, options?: object) => void;
  data: Array<string> | undefined;
  showSaveCancel: boolean;
  selectedAudioIds: Array<number>;
  audioSpeakers: Record<number, string>;
  setAudioSpeakers: (
    value:
      | Record<number, string>
      | ((prev: Record<number, string>) => Record<number, string>)
  ) => void;
  activeChunkId: number | null;
  setActiveChunkId: (id: number | null) => void;
};
type OptionType = { value: string; label: string };

const ModalContentHeader = ({
  isAddingNew,
  newPerson,
  setIsAddingNew,
  setNewPerson,
  selectedOption,
  setSelectedOption,
  setShowSaveCancel,
  status,
  addPerson,
  data,
  showSaveCancel,
  selectedAudioIds,
  audioSpeakers,
  setAudioSpeakers,
  activeChunkId,
  setActiveChunkId,
}: ModalContainerHeader) => {
  const querClient = useQueryClient();

  const handleCancel = () => {
    setSelectedOption(null);
    setShowSaveCancel(false);
  };

  const handleSpeakerSelect = (option: OptionType | null) => {
    if (option?.value === "add-new") {
      setIsAddingNew(true);
    } else {
      setSelectedOption(option);
      if (selectedAudioIds.length > 0) {
        setShowSaveCancel(true);

        const lastSelectedId = selectedAudioIds[selectedAudioIds.length - 1];
        setActiveChunkId(lastSelectedId);
      }
    }
  };

  const handleSaveSpeaker = () => {
    if (!selectedOption || activeChunkId === null) return;

    setAudioSpeakers((prev) => ({
      ...prev,
      [activeChunkId]: selectedOption.value,
    }));

    setShowSaveCancel(false);
    setNewPerson("");
    setSelectedOption(null);
    setActiveChunkId(null);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-lg">
        {status === "untrained" &&
          (isAddingNew ? (
            <form
              className="w-1/2"
              onSubmit={(event) => {
                event.preventDefault();
                addPerson(
                  { labelName: newPerson },
                  {
                    onSuccess: () => {
                      void querClient.invalidateQueries({
                        queryKey: ["trained-persons"],
                      });
                      setNewPerson("");
                      setIsAddingNew(false);
                      toast.success("Person added successfully.");
                    },
                    onError: (error: unknown) => {
                      if (axios.isAxiosError(error)) {
                        const err = error.response?.data as {
                          message?: string;
                        };
                        toast.error(
                          err?.message || "Failed to add new Person."
                        );
                      } else {
                        toast.error("Something went wrong.");
                      }
                    },
                  }
                );
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => {
                    setNewPerson(e.target.value);
                  }}
                  placeholder="Enter new person name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  required
                />
                <button
                  className="px-4 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
                  type="submit"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                  }}
                  type="button"
                  className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <Select
              value={selectedOption}
              options={
                data && data.length > 0
                  ? [{ value: "add-new", label: "Add New Person" }].concat(
                      data.map((person) => ({
                        value: person,
                        label: person,
                      }))
                    )
                  : []
              }
              className="w-1/2"
              isSearchable
              isClearable
              isDisabled={selectedAudioIds.length === 0}
              placeholder={
                selectedAudioIds.length === 0
                  ? "Select audio first to choose person"
                  : "Select person"
              }
              formatOptionLabel={(option) => (
                <div
                  className={`flex justify-between items-center w-full ${
                    option.value === "add-new"
                      ? "font-semibold text-indigo-500"
                      : ""
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === "add-new" && (
                    <span className="text-lg font-bold">+</span>
                  )}
                </div>
              )}
              onChange={handleSpeakerSelect}
            />
          ))}

        {showSaveCancel && selectedOption?.value && (
          <div className="flex gap-2 ml-2">
            <button
              className="px-5 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-2"
              onClick={handleSaveSpeaker}
            >
              <TiTick className="text-md" />
              Save
            </button>
            <button
              className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-100 flex items-center gap-2"
              onClick={handleCancel}
            >
              <RxCross2 className="text-md" />
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FaFolder className="text-3xl text-black" />
          <h3 className="text-lg font-bold text-center text-gray-800 truncate">
            {audioSpeakers[selectedAudioIds[0]] && (
              <span className="px-2 py-1 text-sm font-semibold flex items-center justify-center ">
                {audioSpeakers[selectedAudioIds[0]]}
              </span>
            )}
          </h3>
        </div>
      </div>
    </>
  );
};

export default ModalContentHeader;
