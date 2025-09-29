import Datepicker from "react-tailwindcss-datepicker";
import { useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
// import { OCRMediaFolders } from "./OCRMediaUrduFolders";
// import { OCRMediaUploadMediaModal } from "./OCRMediaUrduUploadMediaModal";
// import { OCRMediaResponse } from "../../../api/useOCRMediaUrduResponse.types";
// import { OCRUrduMediaModal } from "./OCRMediaUrduModal";
import Modal from "../../ui/Modal";
// import useGetOCRUrduMediByDate from "../../../api/useGetOCRUrduMediByDate";
// import useGetAllOCRMedia from "../../../api/useGetAllOCRMedia";
// import { OCRUrduMediaFolderModal } from "./OCRMediaUrduFolderModal";
// import { useIntersectionObserver } from "@uidotdev/usehooks";
// import CircularLoader from "../../primitives/CircularLoader";
// import { toast } from "react-toastify";
// import type { OCRMediaData } from "../../../api/useGetAllOCRMedia.types";
import { OCRDocUrduUploadMediaModal } from "./OCRDocUrduUploadMediaModal";
import { DocumentDataResponse } from "../../../api/useOCRUrduDocResponse.types";
import { OCRDocUrduModal } from "./OCRDocUrduModal";
import { OCRDocUrduFolder } from "./OCRDocUrduFolder";
import useGetOCRUrduDocByDate from "../../../api/useGetOCRUrduDocByDate";
import CircularLoader from "../ocrMediaUrdu/OCRMediaUrduFolders";
import { OCRDocUrduFolderModal } from "./OCRDocUrduFolderModal";

// type Props = {
//   selectedFrames: Set<number>;
//   setSelectedFrames: React.Dispatch<React.SetStateAction<Set<number>>>;
//   selectedFolders: Set<string>;
//   setSelectedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
// };

export const OCRDocUrduUntrainedData = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate") ?? null;
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate") ?? null;
  const endDateDate = endDate ? new Date(endDate) : null;
  const [selectedSource, setSelectedSource] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [ocrModalData, setOCRModalData] = useState<DocumentDataResponse | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [modalOpen, setModalOpen] = useState(false);
  //   const [modalData, setModalData] = useState<OCRMediaData | null>(null);
  const active = searchParams.get("active");
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetOCRUrduDocByDate();
  if (isLoading) return <p>Loading trained data...</p>;
  if (isError) return <p>Failed to fetch trained data</p>;
  const folders =
    data?.pages.flatMap((page) =>
      page.trained.results.map((item) => ({
        type: "trained" as const,
        date: item.date,
        count: item.count,
      }))
    ) ?? [];

  return (
    <div className="w-full space-x-3">
      {active === "UntrainedData" && (
        <div className="grid grid-cols-2 space-x-7">
          <div>
            <Datepicker
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
              inputClassName={twMerge(
                "text-gray-700 w-full rounded-md border border-gray-400 overflow-hidden px-2 text-sm focus:outline-none",
                "h-[38px]"
              )}
              readOnly={true}
            />
          </div>

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
              //   checked={allFoldersSelected}
              //   onChange={(e) => {
              //     handleSelectAll(e.target.checked);
              //   }}
            />
            <span>Select all</span>
          </div>
        </div>
      </div>

      {/* <OCRMediaFolders
        data={{ trained: [], untrained: untrainedData }}
        onFolderClick={() => {
          setModalOpen(true);
        }}
        selectedFolders={selectedFolders}
        onFolderSelect={handleFolderSelect}
      /> */}
      <OCRDocUrduFolder
        folders={folders}
        onOpenModal={() => {
          setIsModalOpen(true);
        }}
      />
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => void fetchNextPage()}
            className="px-4 py-2 bg-coolBlue-500 text-white rounded-lg hover:bg-coolBlue-600 transition"
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <CircularLoader /> : "Load More"}
          </button>
        </div>
      )}
      {isModalOpen && (
        <OCRDocUrduFolderModal
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}

      {/* {modalOpen && (
        <OCRUrduMediaFolderModal
          data={modalData}
          onSave={() => {
            setModalOpen(false);
          }}
          onClose={() => {
            setModalOpen(false);
          }}
          fetchNextPage={() => {
            void fetchNextPage();
          }}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          selectedFrames={selectedFrames}
          onFrameSelect={handleFrameSelect}
          onAllFramesSelect={handleAllFramesSelect}
          isTrained={false}
        />
      )} */}

      {/* Upload modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
            <OCRDocUrduUploadMediaModal
              onClose={() => {
                setIsUploadModalOpen(false);
              }}
              onUploadSuccess={(data) => {
                setIsUploadModalOpen(false);
                setOCRModalData(data);
                setIsMediaModalOpen(true);
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

      {/* Media modal */}
      {isMediaModalOpen && ocrModalData && (
        <Modal>
          <OCRDocUrduModal
            data={ocrModalData}
            onClose={() => {
              setIsMediaModalOpen(false);
            }}
            onSave={() => {
              setIsMediaModalOpen(false);
            }}
          />
        </Modal>
      )}

      {selectedSource === "Upload" && (
        <div className="flex justify-center mt-4">
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
  );
};

export default OCRDocUrduUntrainedData;
