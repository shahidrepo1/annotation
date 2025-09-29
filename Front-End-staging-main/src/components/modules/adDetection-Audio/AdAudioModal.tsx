import { useState, useRef, useEffect } from "react";
import { AudioProcessingResponse } from "../../../api/useAdAudioSegment";
import { backendServiceUrl } from "../../../api/apiConstants";
import useAdAddLabel from "../../../api/useAdAddLabel";
import useGetAdLabels from "../../../api/useGetAdLabels";
import AdVideoModalHeader from "../adDetection-Frame/adVideoModalComponents/AdVideoModalHeader";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import useAdUpdateChunks from "../../../api/useAdUpdateChunks";
type AdModalModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  data: AudioProcessingResponse;
};

export const AdAudioModal = ({ onSave, onClose, data }: AdModalModalProps) => {
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
      updates: data.segments.map((item) => ({
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
        void queryClient.invalidateQueries({ queryKey: ["AudioSegments"] });

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

        <div className="mt-4 overflow-y-auto max-h-64 space-y-4 pr-1">
          {data.segments.map((audio) => (
            <div
              key={audio.id}
              className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:bg-indigo-50 transition duration-150"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-3 w-3 cursor-pointer accent-indigo-600"
                  checked={!!selectedImages[audio.id]}
                  onChange={(e) => {
                    handleCheckboxChange(audio.id, e.target.checked);
                  }}
                  id={`checkbox-${String(audio.id)}`}
                />
              </div>

              <div className="flex-1">
                <audio controls className="w-full">
                  <source
                    src={`${backendServiceUrl.replace(/\/$/, "")}${
                      audio.media_file_url
                    }`}
                    type="audio/mp4"
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="w-1/3 text-center">
                <span className="inline-block text-sm font-medium bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md">
                  {imageLabels[audio.id] || audio.label || "No label"}
                </span>
              </div>
            </div>
          ))}
        </div>

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
