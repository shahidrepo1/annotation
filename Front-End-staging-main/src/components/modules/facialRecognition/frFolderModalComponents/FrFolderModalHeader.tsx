import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Props = {
  isAddingNew: boolean;
  setIsAddingNew: (value: boolean) => void;
  isTrained: boolean | undefined;
  showSaveCancel: boolean;
  setShowSaveCancel: (value: boolean) => void;
  mutate: (data: { label_name: string }, options?: object) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  setSelectedOption: (option: { value: string; label: string } | null) => void;
  setSearchQuery: (value: string) => void;
  filteredPersons: Array<{ value: string; label: string }>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  selectedOption: { value: string; label: string } | null;
  searchQuery: string;
  selectedNames: { [key: string]: string };
  checkedImages: { [key: string]: boolean };
  setSelectedNames: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
};
export const FrFolderModalHeader = ({
  isAddingNew,
  setIsAddingNew,
  isTrained,
  showSaveCancel,
  setShowSaveCancel,
  mutate,
  isDropdownOpen,
  setIsDropdownOpen,
  setSelectedOption,
  setSearchQuery,
  filteredPersons,
  dropdownRef,
  selectedOption,
  searchQuery,
  selectedNames,
  checkedImages,
  setSelectedNames,
}: Props) => {
  const queryClient = useQueryClient();
  const [newLabel, setNewLabel] = useState("");

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

  const handleSaveSpeaker = () => {
    if (!selectedOption) return;

    // Apply the selected label to all checked images
    const updatedSelectedNames = { ...selectedNames };
    Object.keys(checkedImages).forEach((imageKey) => {
      if (checkedImages[imageKey]) {
        updatedSelectedNames[imageKey] = selectedOption.value;
      }
    });

    setSelectedNames(updatedSelectedNames);
    // setCheckedImages({});
    setShowSaveCancel(false);
    setNewLabel("");
  };

  const handleCancel = () => {
    setSelectedOption(null);
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
                      queryKey: ["FrLabel"],
                    });
                    setNewLabel("");
                    setIsAddingNew(false);
                    toast.success("Person added successfully.");
                  },
                  onError: () => {
                    toast.error("Unable to add Person: ");
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
                    filteredPersons.map(
                      (person: { value: string; label: string }) => (
                        <div
                          key={person.value}
                          className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer ${
                            selectedOption?.value === person.value
                              ? "bg-indigo-100"
                              : ""
                          }`}
                          onClick={() => {
                            handleOptionSelect(person.value);
                          }}
                        >
                          {person.value}
                        </div>
                      )
                    )
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
              className="px-5 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 flex items-center gap-2"
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
