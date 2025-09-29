import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router";
import useGetLogoAnnotatedImage from "../../../api/useGetLogoAnnotatedImage";
import { LDTrainedData } from "./LDTrainedData";
import { LDUntrainedData } from "./LDUntrainedData";
import { LDViewAll } from "./LDViewAll";
import { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
// import { LogoFolderDataDisplay } from "./LogoFolderDataDisplay";
import { LogoImageList } from "../../../api/useLogoResponse.types";
import LDUploadMediaModal from "./LDUploadMediaModal";
import { LDModal } from "./LDModal";
import { ImageType } from "../../../api/useGetLogoData.types";
// import { TickerFolderImageDisplay } from "../ticker&flasher/TickerFolderImageDisplay";
import { LogoFolderDataDisplay } from "./LogoFolderDataDisplay";

export const LDTabs = () => {
  const tabs = ["ViewAll", "TrainedData", "UntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("active") || "ViewAll";
  const searchTerm = searchParams.get("label") || "";

  const { data, isLoading } = useGetLogoAnnotatedImage();
  const [selectedFolder, setSelectedFolder] = useState<{
    date: string;
    data: Array<ImageType>;
  } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTickerModal, setShowTickerModal] = useState(false);
  const [logoData, setLogoData] = useState<LogoImageList | null>(null);
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

  const handleFolderClick = (folder: {
    date: string;
    data: Array<ImageType>;
  }) => {
    setSelectedFolder(folder);
  };
  const handleUploadComplete = (uploadedData: LogoImageList) => {
    setLogoData(uploadedData);
    setShowUploadModal(false);
    setShowTickerModal(true);
  };

  const handleBackToTabs = () => {
    setShowUploadModal(false);
    setShowTickerModal(false);
    setLogoData(null);
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
              <LDViewAll
                data={data}
                onFolderClick={handleFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
            {data && activeTab === "TrainedData" && (
              <LDTrainedData
                data={data}
                onFolderClick={setSelectedFolder}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
            {data && activeTab === "UntrainedData" && (
              <LDUntrainedData
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

          <LDUploadMediaModal
            setOpen={() => {
              setShowUploadModal(false);
            }}
            setLogoData={(data) => {
              handleUploadComplete(data);
            }}
            logoData={logoData}
          />
        </div>
      )}

      {showTickerModal && logoData && (
        <div className="bg-white rounded-lg p-6 w-full relative min-h-[70vh]">
          <button
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-800 mb-4"
            onClick={handleBackToTabs}
          >
            <IoMdArrowRoundBack className="text-xl" />
            Back to Tabs
          </button>

          <LDModal logoData={logoData} onCloseModal={handleBackToTabs} />
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
            <span>Back to Tabs</span>
          </button>

          <div className="pt-16">
            <LogoFolderDataDisplay
              logoData={selectedFolder}
              onCloseModal={() => {
                setSelectedFolder(null);
              }}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              isTrained={
                !!data?.results?.trainedData?.find(
                  (trainedFolder) =>
                    trainedFolder.date === selectedFolder.date &&
                    trainedFolder.data.length === selectedFolder.data.length &&
                    trainedFolder.data.every(
                      (trainedImage, index) =>
                        trainedImage.id === selectedFolder.data[index]?.id
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

export default LDTabs;
