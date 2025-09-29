import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import useGetTfProccessedImages from "../../../api/useGetTfProcessedImages";
import TickerViewAll from "./TickerViewAll";
import TickerTrainedData from "./TickerTrainedData";
import TickerUntrainedData from "./TickerUntrainedData";
import { TickerFolderImageDisplay } from "./TickerFolderImageDisplay";
import { TickerDataGroupType } from "../../../api/useGetTfProcessedImages.types";
import { IoMdArrowRoundBack } from "react-icons/io";
import { TickerResponse } from "../../../api/useTickerUpload.types";
import { TickerUploadMediaModal } from "./TickerUploadMediaModal";
import { TickerModal } from "./TickerModal";

const TickerTabs = () => {
  const tabs = ["ViewAll", "TrainedData", "UntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("active") || "ViewAll";
  const searchTerm = searchParams.get("label") || "";

  const { data, isLoading } = useGetTfProccessedImages();
  const [selectedFolder, setSelectedFolder] =
    useState<TickerDataGroupType | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTickerModal, setShowTickerModal] = useState(false);
  const [tfData, setTfData] = useState<TickerResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<number>>([]);

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
    setSelectedFolder(null);
    setShowUploadModal(false);
    setShowTickerModal(false);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: tab,
    });
  };

  const handleFolderClick = (folder: TickerDataGroupType) => {
    setSelectedFolder(folder);
  };

  const handleUploadComplete = (uploadedData: TickerResponse) => {
    setTfData(uploadedData);
    setShowUploadModal(false);
    setShowTickerModal(true);
  };

  const handleBackToTabs = () => {
    setShowUploadModal(false);
    setShowTickerModal(false);
    setTfData(null);
  };

  return (
    <div className="w-full p-4">
      {!selectedFolder && !showUploadModal && !showTickerModal && (
        <>
          <div className="relative w-full">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              className="w-full border border-gray-400 p-2 pl-10 rounded-md outline-none"
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

          <div className="mt-4 p-4 bg-white rounded shadow">
            {data && activeTab === "ViewAll" && (
              <TickerViewAll
                data={data}
                onFolderClick={handleFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
            {data && activeTab === "TrainedData" && (
              <TickerTrainedData
                data={data}
                onFolderClick={setSelectedFolder}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
            {data && activeTab === "UntrainedData" && (
              <TickerUntrainedData
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

          <TickerUploadMediaModal
            setOpen={() => {
              setShowUploadModal(false);
            }}
            setTfData={(data) => {
              handleUploadComplete(data);
            }}
            tfData={tfData}
          />
        </div>
      )}

      {showTickerModal && tfData && (
        <div className="bg-white rounded-lg p-6 w-full relative min-h-[70vh]">
          <button
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-800 mb-4"
            onClick={handleBackToTabs}
          >
            <IoMdArrowRoundBack className="text-xl" />
            Back to Tabs
          </button>

          <TickerModal tfData={tfData} onCloseModal={handleBackToTabs} />
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
            <TickerFolderImageDisplay
              tfData={selectedFolder}
              onCloseModal={() => {
                setSelectedFolder(null);
              }}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              isTrained={
                !!(
                  selectedFolder &&
                  data?.trainedData?.some(
                    (folder) => folder.label === selectedFolder.label
                  )
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TickerTabs;
