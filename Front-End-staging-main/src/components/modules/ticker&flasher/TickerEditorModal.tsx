import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { useState } from "react";
import useGetTfLabels from "../../../api/useGetTfLabels";
import { toast } from "react-toastify";
import Select from "react-select";

type LogoEditorModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  initialLabel?: string;
  onDelete: () => void;
};

export const TickerEditorModal = ({
  onSave,
  onDelete,
  onClose,
  initialLabel,
}: LogoEditorModalProps) => {
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(initialLabel ? { value: initialLabel, label: initialLabel } : null);
  const { data: labels, isLoading, isError } = useGetTfLabels();

  const handleSave = () => {
    if (selectedOption?.value) {
      onSave(selectedOption.value);
      onClose();
    } else {
      toast.error("Please select a label");
    }
  };

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedOption(option);
  };

  const options = labels
    ? labels?.map((label) => ({
        value: label.label_name,
        label: label.label_name,
      }))
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md flex flex-col space-y-2 w-80 h-96 overflow-y-auto relative">
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
            <div className="text-center text-red-500">Error loading labels</div>
          ) : (
            <>
              <Select
                value={selectedOption}
                options={options}
                className="w-full"
                isSearchable
                placeholder="Select label"
                isClearable
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
