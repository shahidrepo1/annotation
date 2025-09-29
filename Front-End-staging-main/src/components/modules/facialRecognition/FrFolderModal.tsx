import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import useFrAddPerson from "../../../api/useFrAddPeron";
import useGetFrLabels from "../../../api/useGetFrLabels";
import { useQueryClient } from "@tanstack/react-query";
import useFrProcessedImage from "../../../api/useFrProcessedImage";
import { FrFolderType } from "../../../api/useFrLabelChunks.types";
import useDeleteFrChunks from "../../../api/useDeleteFrChunks";
import { FrFolderModalHeader } from "./frFolderModalComponents/FrFolderModalHeader";
import { FrFolderModalImageDisplay } from "./frFolderModalComponents/FrFolderModalImageDisplay";
import { useFrCheckedImages } from "../../../hooks/useFrCheckedImages";

type FrFolderModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  frData: FrFolderType;
  isTrained?: boolean;
};

export const FrFolderModal = ({
  onSave,
  onClose,
  frData,
  isTrained,
}: FrFolderModalProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNames, setSelectedNames] = useState<{ [key: string]: string }>(
    {}
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: updateProcessedImage } = useFrProcessedImage();
  const { data: labelsData, isLoading, isError } = useGetFrLabels();
  const { mutate } = useFrAddPerson();
  const { mutate: deletePerson } = useDeleteFrChunks();
  const queryClient = useQueryClient();
  const { checkedImages, resetCheckedImages } = useFrCheckedImages();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredPersons =
    labelsData
      ?.filter((person: string) =>
        person.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((person) => ({
        value: person,
        label: person,
      })) ?? [];

  const handleDelete = (image_id: number) => {
    deletePerson(image_id, {
      onSuccess: () => {
        toast.success("Chunk deleted successfully");
        void queryClient.invalidateQueries({ queryKey: ["ProccessedImages"] });
        onClose();
      },
      onError: () => {
        toast.error("Failed to delete chunk");
      },
    });
  };

  const handleSave = () => {
    if (!selectedOption?.value) return;

    const checkedImagesWithIds = Object.entries(checkedImages)
      .filter(([isChecked]) => isChecked)
      .map(([imageKey]) => {
        const image = frData.images.find(
          (img) => img.processedImage === imageKey
        );
        return image ? image.id : null;
      })
      .filter((id): id is number => id !== null);

    if (checkedImagesWithIds.length === 0) {
      toast.warning("No images selected");
      return;
    }

    const payload = {
      updates: checkedImagesWithIds.map((image_id) => ({
        image_id,
        label: selectedOption.value,
      })),
    };

    updateProcessedImage(payload, {
      onSuccess: () => {
        toast.success("Labels updated successfully");
        onSave(selectedOption.value);
        void queryClient.invalidateQueries({ queryKey: ["ProccessedImages"] });
        void queryClient.invalidateQueries({ queryKey: ["FrLabel"] });
        resetCheckedImages();
        onClose();
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="p-8 bg-white rounded-lg">Loading labels...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="p-8 bg-white rounded-lg text-red-500">
          Error loading labels
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 space-y-4 bg-white w-[900px] min-h-[450px] h-fit px-6 rounded-xl mx-auto shadow-lg border border-indigo-600 overflow-auto">
        <FrFolderModalHeader
          isAddingNew={isAddingNew}
          setIsAddingNew={setIsAddingNew}
          isTrained={isTrained}
          showSaveCancel={showSaveCancel}
          setShowSaveCancel={setShowSaveCancel}
          mutate={mutate}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          setSelectedOption={setSelectedOption}
          setSearchQuery={setSearchQuery}
          filteredPersons={filteredPersons}
          dropdownRef={dropdownRef}
          selectedOption={selectedOption}
          searchQuery={searchQuery}
          selectedNames={selectedNames}
          setSelectedNames={setSelectedNames}
          checkedImages={checkedImages}
        />

        <FrFolderModalImageDisplay
          frData={frData}
          handleDelete={handleDelete}
          isTrained={isTrained}
          selectedNames={selectedNames}
        />

        {!isAddingNew && !showSaveCancel && (
          <div className="flex justify-center gap-2">
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
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:border-red-700 hover:text-red-700 flex items-center gap-2"
            >
              <RxCross2 className="text-md text-red-500 hover:text-white" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
