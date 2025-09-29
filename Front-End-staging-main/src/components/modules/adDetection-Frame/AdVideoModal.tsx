import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { AdLabelType } from "../../../api/useGetAdLabels.types";
import useAdAddLabel from "../../../api/useAdAddLabel";
import useGetAdLabels from "../../../api/useGetAdLabels";
import { useQueryClient } from "@tanstack/react-query";
import useAdUpdateChunks from "../../../api/useAdUpdateChunks";
import AdVideoModalHeader from "./adVideoModalComponents/AdVideoModalHeader";
import AdVideoDisplay from "./adVideoModalComponents/AdVideoDisplay";
type AdModalModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  adData: AdLabelType;
};

export const AdModal = ({ onSave, onClose, adData }: AdModalModalProps) => {
  const [newLabel, setNewLabel] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<Record<number, boolean>>(
    {}
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeChunkId, setActiveChunkId] = useState<number | null>(null);
  const { data: labelsData, isLoading, isError } = useGetAdLabels();
  const { mutate: updateChunk } = useAdUpdateChunks();
  const { mutate } = useAdAddLabel();
  const [imageLabels, setImageLabels] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (activeChunkId !== null && selectedOption?.value) {
      setImageLabels((prev) => ({
        ...prev,
        [activeChunkId]: selectedOption.value,
      }));
    }
  }, [selectedOption, activeChunkId]);

  const filteredPersons =
    labelsData?.data.filter((person: string) =>
      person.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleSave = () => {
    if (!selectedOption?.value) {
      toast.error("Please select the label");
      return;
    }

    const payload = {
      updates: adData.chunk.map((item) => ({
        chunk_id: item.id,
        label: selectedOption.value,
      })),
    };

    updateChunk(payload, {
      onSuccess: () => {
        toast.success("Folder Created successfully");
        onSave(selectedOption.value);
        void queryClient.invalidateQueries({ queryKey: ["AdUpdateChunks"] });
        void queryClient.invalidateQueries({ queryKey: ["AdSegments"] });
        onClose();
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    });
  };
  const handleCheckboxChange = (imageId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedImages((prev) => ({ ...prev, [imageId]: true }));
      setIsDropdownOpen(true);
      setActiveChunkId(imageId);
    } else {
      const newSelectedImages = { ...selectedImages };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete newSelectedImages[imageId];
      setSelectedImages(newSelectedImages);

      const newImageLabels = { ...imageLabels };
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete newImageLabels[imageId];
      setImageLabels(newImageLabels);

      if (activeChunkId === imageId) {
        setActiveChunkId(null);
      }
    }
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
        <AdVideoModalHeader
          isAddingNew={isAddingNew}
          setIsAddingNew={setIsAddingNew}
          setIsDropdownOpen={setIsDropdownOpen}
          setSearchQuery={setSearchQuery}
          setSelectedOption={setSelectedOption}
          mutate={mutate}
          dropdownRef={dropdownRef}
          isDropdownOpen={isDropdownOpen}
          searchQuery={searchQuery}
          showSaveCancel={showSaveCancel}
          filteredPersons={filteredPersons}
          setShowSaveCancel={setShowSaveCancel}
          selectedOption={selectedOption}
          imageLabels={imageLabels}
          selectedImages={selectedImages}
          setNewLabel={setNewLabel}
          newLabel={newLabel}
          setImageLabels={setImageLabels}
          activeChunkId={activeChunkId}
          setActiveChunkId={setActiveChunkId}
        />
        <AdVideoDisplay
          selectedImages={selectedImages}
          adData={adData}
          imageLabels={imageLabels}
          handleCheckboxChange={handleCheckboxChange}
        />
        {!isAddingNew && !showSaveCancel && (
          <div className="flex justify-center gap-2">
            <button
              onClick={handleSave}
              disabled={!selectedOption}
              className={`px-5 py-2 border rounded-lg flex items-center gap-2  bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer`}
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg bg-white hover:bg-indigo-600 hover:text-white flex items-center gap-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
