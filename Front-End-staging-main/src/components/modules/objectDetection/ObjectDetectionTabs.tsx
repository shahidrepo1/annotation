import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { ObjectDetectionViewAll } from "./ObjectDetectionViewAll";
import { ObjectDetectionTrainedData } from "./ObjectDetectionTrainedData";
import { ObjectDetectionUntrainedData } from "./ObjectDetectionUntrainedData";
import { useState } from "react";
import { ProcessedDataResponse } from "../../../api/useObjectResponse.types";
import { IoMdArrowRoundBack } from "react-icons/io";
import { ObjectDetectionUploadMediaModal } from "./ObjectDetectionUploadMediaModal";
import { ObjectDetectionImageDisplay } from "./ObjectDetectionImageDisplay";
import useGetOdProccessedImages from "../../../api/useGetOdProcessedImage";
import { OdLabeledImageGroup } from "../../../api/useGetOdProcessedImages.types";
import { ObjectDetectionFolderImageDisplay } from "./ObjectDetectionFolderImageDisplay";

export const ObjectDetectionTabs = () => {
  const tabs = ["ViewAll", "TrainedData", "UntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("active") || "ViewAll";
  const searchTerm = searchParams.get("label") || "";
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showObjectModal, setshowObjectModal] = useState(false);
  const [odData, setOdData] = useState<ProcessedDataResponse | null>(null);
  const { data, isLoading } = useGetOdProccessedImages();
  const [selectedIds, setSelectedIds] = useState<Array<number>>([]);
  const [selectedFolder, setSelectedFolder] =
    useState<OdLabeledImageGroup | null>(null);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    );
  }
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      label: e.target.value || "",
      active: activeTab,
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: tab,
      label: searchTerm,
    });
  };
  const handleFolderClick = (folder: OdLabeledImageGroup) => {
    setSelectedFolder(folder);
  };

  const handleUploadComplete = (uploadedData: ProcessedDataResponse) => {
    setOdData(uploadedData);
    setShowUploadModal(false);
    setshowObjectModal(true);
  };

  const handleBackToTabs = () => {
    setShowUploadModal(false);
    setshowObjectModal(false);
    setOdData(null);
  };

  return (
    <div className="w-full p-4">
      {!selectedFolder && !showUploadModal && !showObjectModal && (
        <>
          <div className="relative w-full">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              className="w-full border border-gray-400 p-2 pl-10 rounded-md outline-none "
              type="search"
              placeholder="Search Folder"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex border-indigo-300 justify-center rounded-lg p-5">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`py-4 px-5 text-black font-medium focus:outline-none bg-indigo-200 hover:text-indigo-700 ${
                  activeTab === tab ? "border-b-2 border-indigo-600" : ""
                }`}
                onClick={() => {
                  handleTabChange(tab);
                }}
              >
                {tab.replace(/([A-Z])/g, " $1").trim()}
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-white-100 rounded shadow">
            {activeTab === "ViewAll" && data && (
              <ObjectDetectionViewAll
                data={data}
                onFolderClick={handleFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
            {activeTab === "TrainedData" && data && (
              <ObjectDetectionTrainedData
                data={data}
                onFolderClick={handleFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
            {activeTab === "UntrainedData" && data && (
              <ObjectDetectionUntrainedData
                data={data}
                onFolderClick={handleFolderClick}
                onUploadClick={() => {
                  setShowUploadModal(true);
                }}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
          </div>
        </>
      )}

      {showUploadModal && (
        <div className="bg-white rounded-lg p-6 w-full relative min-h-[70vh]">
          <button
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-800 mb-4"
            onClick={handleBackToTabs}
          >
            <IoMdArrowRoundBack className="text-xl" />
            Back to Tabs
          </button>

          <ObjectDetectionUploadMediaModal
            setOpen={() => {
              setShowUploadModal(false);
            }}
            setOdData={(data) => {
              handleUploadComplete(data);
            }}
            odData={odData}
          />
        </div>
      )}

      {showObjectModal && odData && (
        <div className="bg-white rounded-lg p-6 w-full relative min-h-[70vh]">
          <button
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-800 mb-4"
            onClick={handleBackToTabs}
          >
            <IoMdArrowRoundBack className="text-xl" />
            Back to Tabs
          </button>

          <ObjectDetectionImageDisplay
            odData={odData}
            onCloseModal={handleBackToTabs}
          />
        </div>
      )}
      {selectedFolder && (
        <div className="bg-white rounded-lg p-4 w-full min-h-[70vh] relative">
          <button
            className="absolute top-4 left-4 z-10 flex items-center text-indigo-500 bg-white p-2 rounded shadow"
            onClick={() => {
              setSelectedFolder(null);
            }}
          >
            <IoMdArrowRoundBack className="text-2xl mr-2" />
            <span>Back</span>
          </button>

          <div className="pt-16">
            <ObjectDetectionFolderImageDisplay
              odData={selectedFolder}
              onCloseModal={() => {
                setSelectedFolder(null);
              }}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              isTrained={
                !!data?.trainedData?.find(
                  (folder) =>
                    folder.label === selectedFolder.label &&
                    folder.images.length === selectedFolder.images.length
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
