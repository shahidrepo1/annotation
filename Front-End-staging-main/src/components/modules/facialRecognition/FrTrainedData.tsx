import FrFolders from "./FrFolders";
import {
  FrFolderType,
  FrProcessedDataType,
} from "../../../api/useFrLabelChunks.types";
import Modal from "../../ui/Modal";
import { useEffect, useState } from "react";
import { FrFolderModal } from "./FrFolderModal";
import { useFrCheckedImages } from "../../../hooks/useFrCheckedImages";

export const FrTrainedData = ({ data }: { data: FrProcessedDataType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FrFolderType | null>(
    null
  );
  const { setImageChecked, checkedImages } = useFrCheckedImages();

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<
    Record<string, boolean>
  >({});

  const handleOpenModal = (label: FrFolderType) => {
    setSelectedFolder(label);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFolder(null);
  };

  const handleFolderSelect = (folder: FrFolderType, isSelected: boolean) => {
    folder.images.forEach((image) => {
      setImageChecked(image.processedImage, isSelected);
    });
  };
  useEffect(() => {
    const allImageIds = data.trainedData.flatMap((folder) =>
      folder.images.map((image) => image.processedImage)
    );

    const allChecked =
      allImageIds.length > 0 && allImageIds.every((id) => checkedImages[id]);

    setSelectAllChecked(allChecked);

    const folderSelections: Record<string, boolean> = {};
    data.trainedData.forEach((folder) => {
      const folderAllChecked =
        folder.images.length > 0 &&
        folder.images.every((img) => checkedImages[img.processedImage]);
      folderSelections[folder.label] = folderAllChecked;
    });

    setSelectedFolders(folderSelections);
  }, [checkedImages, data.trainedData]);

  return (
    <div className="w-full space-x-3">
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-bold text-xl p-3">Trained Data</h1>
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 text-sm cursor-pointer"
            checked={selectAllChecked}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setSelectAllChecked(isChecked);

              const newCheckedImages: Record<string, boolean> = {};
              const newSelectedFolders: Record<string, boolean> = {};

              data.trainedData.forEach((folder) => {
                newSelectedFolders[folder.label] = isChecked;
                folder.images.forEach((image) => {
                  newCheckedImages[image.processedImage] = isChecked;
                });
              });

              Object.keys(newCheckedImages).forEach((imagePath) => {
                setImageChecked(imagePath, newCheckedImages[imagePath]);
              });
              setSelectedFolders(newSelectedFolders);
            }}
          />
          <span>Select all</span>
        </div>
      </div>
      <FrFolders
        data={data.trainedData}
        onFolderClick={handleOpenModal}
        onFolderSelect={handleFolderSelect}
        selectedFolders={selectedFolders}
        setSelectedFolders={setSelectedFolders}
        isTrained={true}
        checkedImages={checkedImages}
      />

      {isModalOpen && selectedFolder && (
        <Modal>
          <FrFolderModal
            onSave={handleCloseModal}
            onClose={handleCloseModal}
            frData={selectedFolder}
            isTrained={true}
          />
        </Modal>
      )}
    </div>
  );
};

export default FrTrainedData;
