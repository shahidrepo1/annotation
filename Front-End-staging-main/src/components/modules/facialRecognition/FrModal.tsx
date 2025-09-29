import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { FrType } from "../../../api/useFrChunks.types";
import useFrAddPerson from "../../../api/useFrAddPeron";
import useGetFrLabels from "../../../api/useGetFrLabels";
import { useQueryClient } from "@tanstack/react-query";
import useFrProcessedImage from "../../../api/useFrProcessedImage";
import { FrModalHeader } from "./frModalComponents/FrModalHeader";
import { FrModalImageDisplay } from "./frModalComponents/FrModalImageDisplay";

type FrModalModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  frData: FrType;
};

export const FrModal = ({ onSave, onClose, frData }: FrModalModalProps) => {
  const [newLabel, setNewLabel] = useState("");
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
  const [selectedImages, setSelectedImages] = useState<{
    [key: string]: boolean;
  }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: updateImage } = useFrProcessedImage();
  const { data: labelsData, isLoading, isError } = useGetFrLabels();
  const { mutate } = useFrAddPerson();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (frData.faces.length) {
      const initialNames: { [key: string]: string } = {};

      frData.faces.forEach((face) => {
        if (face.label) {
          initialNames[face.processed_image] = face.label;
        }
      });

      setSelectedNames(initialNames);
    }
  }, [frData]);

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

  const handleSave = () => {
    const labeledImages = Object.entries(selectedNames)
      .filter(([label]) => label.trim() !== "")
      .map(([imgUrl, label]) => {
        const face = frData.faces.find((f) => f.processed_image === imgUrl);
        return face
          ? {
              image_id: face.id,
              label,
            }
          : null;
      })
      .filter(
        (item): item is { image_id: number; label: string } => item !== null
      );

    if (labeledImages.length === 0) {
      toast.error("Please label at least one image");
      return;
    }

    const payload = {
      updates: labeledImages,
    };

    updateImage(payload, {
      onSuccess: () => {
        toast.success("Labels saved successfully");
        onSave("Processing Completed");
        void queryClient.invalidateQueries({ queryKey: ["ProccessedImages"] });
        void queryClient.invalidateQueries({ queryKey: ["FrLabel"] });
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

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages((prev) => ({
      ...prev,
      [imageUrl]: !prev[imageUrl],
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[900px] h-[500px] rounded-xl mx-auto shadow-lg border border-indigo-600 flex flex-col px-6 py-4">
        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
          <FrModalHeader
            isAddingNew={isAddingNew}
            mutate={mutate}
            setSelectedOption={setSelectedOption}
            setIsDropdownOpen={setIsDropdownOpen}
            setSearchQuery={setSearchQuery}
            setShowSaveCancel={setShowSaveCancel}
            setIsAddingNew={setIsAddingNew}
            selectedOption={selectedOption}
            setSelectedNames={setSelectedNames}
            frData={frData}
            setNewLabel={setNewLabel}
            newLabel={newLabel}
            dropdownRef={dropdownRef}
            isDropdownOpen={isDropdownOpen}
            searchQuery={searchQuery}
            showSaveCancel={showSaveCancel}
            filteredPersons={filteredPersons}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />

          <FrModalImageDisplay
            frData={frData}
            selectedNames={selectedNames}
            selectedImages={selectedImages}
            onToggleImage={toggleImageSelection}
          />
        </div>

        <div className="flex justify-center gap-2 mt-4 shrink-0 border-t pt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2 border rounded-lg flex items-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
          >
            <TiTick className="text-md" />
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg bg-white hover:bg-indigo-600 hover:text-white flex items-center gap-2"
          >
            <RxCross2 className="text-md" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
