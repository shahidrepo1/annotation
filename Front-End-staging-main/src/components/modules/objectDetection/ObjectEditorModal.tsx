import { useState } from "react";
import useGetOdLabels from "../../../api/useGetOdLabels";
import { toast } from "react-toastify";
import Select from "react-select";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { useQueryClient } from "@tanstack/react-query";
import useOdAddLabel, { OdAddLabel } from "../../../api/useOdAddLabels";

type ObjectEditorModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  initialLabel?: string;
  onDelete: () => void;
};
export const ObjectEditorModal = ({
  onSave,
  onClose,
  initialLabel,
  onDelete,
}: ObjectEditorModalProps) => {
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(initialLabel ? { value: initialLabel, label: initialLabel } : null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const { data: labels, isLoading, isError } = useGetOdLabels();
  const { mutate } = useOdAddLabel();
  const queryClient = useQueryClient();
  const handleSave = () => {
    if (selectedOption?.value) {
      onSave(selectedOption.value);
      onClose();
    } else {
      toast.error("Please select a label");
    }
  };

  const handleAddNewLabel = () => {
    if (!newLabel.trim()) {
      toast.error("Please enter a label name");
      return;
    }

    const labelPayload: OdAddLabel = {
      label_name: newLabel.trim(),
    };

    mutate(labelPayload, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["OdLabels"] });
        toast.success("Label added successfully");
        setIsAddingNew(false);
        setNewLabel("");
      },
      onError: () => {
        toast.error("Label already exists");
      },
    });
  };

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    if (option?.value === "add-new") {
      setIsAddingNew(true);
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
      setIsAddingNew(false);
    }
  };

  const options = Array.isArray(labels)
    ? [{ value: "add-new", label: "Add New Label" }].concat(
        labels.map(
          (label: { id: number; label_name: string; user_email: string }) => ({
            value: label.label_name,
            label: label.label_name,
          })
        )
      )
    : [{ value: "add-new", label: "Add New Label" }];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-md flex flex-col space-y-2 w-80 h-96 overflow-y-auto">
          <div className="bg-indigo-600 text-white p-2 sticky top-0 z-10 flex justify-between items-center">
            <h2 className="text-2xl">Annotator Editor</h2>
            <button onClick={onClose} className="text-white hover:text-red-300">
              <RxCross2 className="text-xl" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-grow">
            {isLoading ? (
              <div className="text-center">Loading labels...</div>
            ) : isError ? (
              <div className="text-center text-red-500">
                Error loading labels
              </div>
            ) : isAddingNew ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddNewLabel();
                }}
              >
                <div className="flex flex-col items-center gap-2">
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
                  <div className="space-x-2">
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
                </div>
              </form>
            ) : (
              <>
                <Select
                  value={selectedOption}
                  options={options}
                  className="w-full"
                  isSearchable
                  placeholder="Select label"
                  isClearable
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
                  onChange={handleSelectChange}
                  maxMenuHeight={200}
                />

                <div className="flex justify-center gap-2">
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:border-red-700 hover:text-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!selectedOption}
                    className={`px-5 py-2 border rounded-lg flex items-center gap-2 ${
                      selectedOption
                        ? "text-green-500 border-green-500 hover:border-green-700 hover:text-green-700"
                        : "text-gray-400 border-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <TiTick className="text-md" />
                    Save
                  </button>
                  {/* <button
                    onClick={onClose}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:border-red-700 hover:text-red-700 flex items-center gap-2"
                  >
                    <RxCross2 className="text-md text-red-500 hover:text-white" />
                    Cancel
                  </button> */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
