import DatePicker from "../../ui/DatePicker";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FrFolders from "./FrFolders";
import { FrUploadMediaModal } from "./FrUploadMediaModal";
import { IoClose } from "react-icons/io5";
import {
  FrFolderType,
  FrProcessedDataType,
} from "../../../api/useFrLabelChunks.types";
import Modal from "../../ui/Modal";
import { FrFolderModal } from "./FrFolderModal";
import { useFrCheckedImages } from "../../../hooks/useFrCheckedImages";
import { FrModal } from "./FrModal";
import { FrType } from "../../../api/useFrChunks.types";

export const FrUntrainedData = ({ data }: { data: FrProcessedDataType }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate") ?? null;
  const endDate = searchParams.get("endDate") ?? null;
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDateDate = endDate ? new Date(endDate) : null;
  const [selectedSource, setSelectedSource] = useState("");
  const active = searchParams.get("active");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FrFolderType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<
    Record<string, boolean>
  >({});
  const [uploadedFrData, setUploadedFrData] = useState<FrType | null>(null);
  const [isFrModalOpen, setIsFrModalOpen] = useState(false);

  const { setImageChecked, checkedImages } = useFrCheckedImages();

  const handleOpenModal = (label: FrFolderType) => {
    setSelectedFolder(label);
    setIsModalOpen(true);
  };

  const handleFolderSelect = (folder: FrFolderType, isSelected: boolean) => {
    folder.images.forEach((image) => {
      setImageChecked(image.processedImage, isSelected);
    });
  };

  useEffect(() => {
    const allImageIds = data.untrainedData.flatMap((folder) =>
      folder.images.map((image) => image.processedImage)
    );

    const allChecked =
      allImageIds.length > 0 && allImageIds.every((id) => checkedImages[id]);

    setSelectAllChecked(allChecked);

    const folderSelections: Record<string, boolean> = {};
    data.untrainedData.forEach((folder) => {
      const folderAllChecked =
        folder.images.length > 0 &&
        folder.images.every((img) => checkedImages[img.processedImage]);
      folderSelections[folder.label] = folderAllChecked;
    });

    setSelectedFolders(folderSelections);
  }, [checkedImages, data.untrainedData]);

  return (
    <>
      <div className="w-full space-x-3">
        {active === "UntrainedData" && (
          <div className="grid grid-cols-2 space-x-7">
            <DatePicker
              value={{ startDate: startDateDate, endDate: endDateDate }}
              onChange={(value) => {
                if (!value) return;
                if (!value.startDate && !value.endDate) {
                  setSearchParams((curr) => {
                    curr.delete("startDate");
                    curr.delete("endDate");
                    return curr;
                  });
                  return;
                }
                setSearchParams((curr) => {
                  curr.set(
                    "startDate",
                    value.startDate?.toISOString().slice(0, 10) ?? ""
                  );
                  curr.set(
                    "endDate",
                    value.endDate?.toISOString().slice(0, 10) ?? ""
                  );
                  return curr;
                });
              }}
              readOnly={true}
            />

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
                checked={selectAllChecked}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSelectAllChecked(isChecked);

                  const newSelectedFolders: Record<string, boolean> = {};
                  data.untrainedData.forEach((folder) => {
                    newSelectedFolders[folder.label] = isChecked;
                    folder.images.forEach((image) => {
                      setImageChecked(image.processedImage, isChecked);
                    });
                  });
                  setSelectedFolders(newSelectedFolders);
                }}
              />
              <span>Select all</span>
            </div>
          </div>
        </div>

        <FrFolders
          data={data.untrainedData}
          onFolderClick={handleOpenModal}
          onFolderSelect={handleFolderSelect}
          selectedFolders={selectedFolders}
          setSelectedFolders={setSelectedFolders}
          isTrained={false}
          checkedImages={checkedImages}
        />

        {isUploadModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
              <FrUploadMediaModal
                setOpen={setIsUploadModalOpen}
                onUploadSuccess={(data) => {
                  setUploadedFrData(data);
                  setIsFrModalOpen(true);
                  setIsUploadModalOpen(false);
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

        {isModalOpen && selectedFolder && (
          <Modal>
            <FrFolderModal
              onClose={() => {
                setIsModalOpen(false);
              }}
              onSave={() => {
                setIsModalOpen(false);
              }}
              frData={selectedFolder}
              isTrained={false}
            />
          </Modal>
        )}

        {isFrModalOpen && uploadedFrData && (
          <Modal>
            <FrModal
              frData={uploadedFrData}
              onClose={() => {
                setIsFrModalOpen(false);
              }}
              onSave={() => {
                setIsFrModalOpen(false);
              }}
            />
          </Modal>
        )}

        {selectedSource === "Upload" && (
          <div className="flex justify-center mt-4 fixed bottom-0 left-0 right-0 p-3 bg-white">
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
      </div>
    </>
  );
};

export default FrUntrainedData;
