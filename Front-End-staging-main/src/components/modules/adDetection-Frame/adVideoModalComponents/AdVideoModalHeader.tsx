import { useQueryClient } from "@tanstack/react-query";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

type AdVideoModalHeaderProps = {
  isAddingNew: boolean;
  mutate: (data: { label_name: string }, options?: object) => void;
  setSelectedOption: (option: { value: string; label: string } | null) => void;
  setIsDropdownOpen: (value: boolean) => void;
  setSearchQuery: (value: string) => void;
  setShowSaveCancel: (value: boolean) => void;
  setIsAddingNew: (value: boolean) => void;
  selectedOption: { value: string; label: string } | null;
  setNewLabel: React.Dispatch<React.SetStateAction<string>>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  isDropdownOpen: boolean;
  searchQuery: string;
  showSaveCancel: boolean;
  filteredPersons: Array<string>;
  imageLabels?: { [key: string]: string };
  selectedImages?: Record<number, boolean>;
  setImageLabels: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  newLabel: string;
  activeChunkId: number | null;
  setActiveChunkId: React.Dispatch<React.SetStateAction<number | null>>;
  isTrained?: boolean;
};

const AdVideoModalHeader = ({
  isAddingNew,
  setSelectedOption,
  setIsDropdownOpen,
  mutate,
  setSearchQuery,
  setShowSaveCancel,
  setIsAddingNew,
  selectedOption,
  setNewLabel,
  dropdownRef,
  isDropdownOpen,
  searchQuery,
  showSaveCancel,
  filteredPersons,
  setImageLabels,
  newLabel,
  activeChunkId,
  isTrained,
}: AdVideoModalHeaderProps) => {
  const queryClient = useQueryClient();

  const handleOptionSelect = (option: string) => {
    setSelectedOption({ value: option, label: option });
    setIsDropdownOpen(false);
    setSearchQuery("");
    setShowSaveCancel(true);
  };

  const handleAddNewClick = () => {
    setIsDropdownOpen(false);
    setIsAddingNew(true);
    setSelectedOption(null);
  };

  const handleCancel = () => {
    setSelectedOption(null);
    setShowSaveCancel(false);
  };

  const handleSaveSpeaker = () => {
    if (!selectedOption || activeChunkId === null) return;

    setImageLabels((prev) => ({
      ...prev,
      [activeChunkId]: selectedOption.value,
    }));

    setShowSaveCancel(false);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-lg">
        {isAddingNew ? (
          <form
            className="w-1/2"
            onSubmit={(event) => {
              event.preventDefault();
              mutate(
                { label_name: newLabel },
                {
                  onSuccess: () => {
                    void queryClient.invalidateQueries({
                      queryKey: ["AdAddLabel"],
                    });
                    setNewLabel("");
                    setIsAddingNew(false);
                    void queryClient.invalidateQueries({
                      queryKey: ["AdLabels"],
                    });
                    toast.success("Person added successfully.");
                  },
                  onError: (error: unknown) => {
                    if (isAxiosError(error)) {
                      const errorMessage = (error as Error).message;
                      toast.error(errorMessage);
                    }
                  },
                }
              );
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => {
                  setNewLabel(e.target.value);
                }}
                placeholder="Enter new label name"
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
        ) : isTrained ? (
          <div className="w-1/2">
            <span className="truncate text-red-500">
              Trained data - No label selection Available
            </span>
          </div>
        ) : (
          <div className="w-1/2 relative" ref={dropdownRef}>
            <div
              className="flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer bg-white"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <span className="truncate">
                {selectedOption?.label || "Select person"}
              </span>
              <FiChevronDown
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search persons..."
                    className="w-full px-2 py-1 border rounded"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div
                    className="flex items-center px-3 py-2 font-semibold text-indigo-500 hover:bg-indigo-50 cursor-pointer border-t"
                    onClick={handleAddNewClick}
                  >
                    <FiPlus className="mr-2" />
                    Add New Person
                  </div>
                  {filteredPersons.length > 0 ? (
                    filteredPersons.map((person) => (
                      <div
                        key={person}
                        className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer ${
                          selectedOption?.value === person
                            ? "bg-indigo-100"
                            : ""
                        }`}
                        onClick={() => {
                          handleOptionSelect(person);
                        }}
                      >
                        {person}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      No persons found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showSaveCancel && selectedOption?.value && (
          <div className="flex gap-2 ml-2">
            <button
              className="px-5 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-2"
              onClick={handleSaveSpeaker}
            >
              <TiTick className="text-md" />
              Add
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
      </div>
    </>
  );
};

export default AdVideoModalHeader;
