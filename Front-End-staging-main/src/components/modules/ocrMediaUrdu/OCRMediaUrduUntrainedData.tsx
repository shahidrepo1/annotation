import Datepicker from "react-tailwindcss-datepicker";
import { useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { OCRMediaFolders } from "./OCRMediaUrduFolders";
import { OCRMediaUploadMediaModal } from "./OCRMediaUrduUploadMediaModal";
import { OCRMediaResponse } from "../../../api/useOCRMediaUrduResponse.types";
import { OCRUrduMediaModal } from "./OCRMediaUrduModal";
import Modal from "../../ui/Modal";
import useGetOCRUrduMediByDate from "../../../api/useGetOCRUrduMediByDate";
import useGetAllOCRMedia from "../../../api/useGetAllOCRMedia";
import { OCRUrduMediaFolderModal } from "./OCRMediaUrduFolderModal";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import CircularLoader from "../../primitives/CircularLoader";
import { toast } from "react-toastify";
import type { OCRMediaData } from "../../../api/useGetAllOCRMedia.types";

type Props = {
  selectedFrames: Set<number>;
  setSelectedFrames: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectedFolders: Set<string>;
  setSelectedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const OCRMediaUntrainedData = ({
  selectedFrames,
  setSelectedFrames,
  selectedFolders = new Set(),
  setSelectedFolders,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDate = searchParams.get("startDate") ?? null;
  const startDateDate = startDate ? new Date(startDate) : null;
  const endDate = searchParams.get("endDate") ?? null;
  const endDateDate = endDate ? new Date(endDate) : null;
  const [selectedSource, setSelectedSource] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [ocrModalData, setOCRModalData] = useState<OCRMediaResponse | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<OCRMediaData | null>(null);
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [clickedFolder, setClickedFolder] = useState<{
    type: string;
    date: string;
  } | null>(null);
  const active = searchParams.get("active");

  const { data, isLoading, isError } = useGetOCRUrduMediByDate();
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch,
  } = useGetAllOCRMedia();

  const handleFolderClick = async (type: string, date: string) => {
    setClickedFolder({ type, date });
    setIsFolderLoading(true);
    setSearchParams({ type, date });
    await refetch();
  };

  useEffect(() => {
    if (paginatedData && clickedFolder && !isPending && !isRefetching) {
      setModalData({
        results: paginatedData.pages.flatMap((page) => page.results),
        pagination_data:
          paginatedData.pages[paginatedData.pages.length - 1].pagination_data,
      });
      setModalOpen(true);
      setIsFolderLoading(false);
      setClickedFolder(null);
    }
  }, [paginatedData, isPending, isRefetching, clickedFolder]);

  const allResults = paginatedData?.pages.flatMap((page) => page.results) ?? [];

  const [ref, entry] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "0px",
    root: null,
  });

  useEffect(() => {
    if (
      entry?.isIntersecting &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isPending
    ) {
      fetchNextPage().catch(() => {
        toast.error("Failed to fetch more OCR media");
      });
    }
  }, [entry, hasNextPage, isFetchingNextPage, isPending, fetchNextPage]);

  const handleFolderSelect = (
    type: string,
    date: string,
    isSelected: boolean
  ) => {
    setSelectedFolders((prev) => {
      const newSet = new Set(prev);
      const folderKey = `${type}-${date}`;

      if (isSelected) {
        newSet.add(folderKey);
      } else {
        newSet.delete(folderKey);
      }

      return newSet;
    });

    if (modalData) {
      const frameIds = modalData.results.flatMap(
        (file) => file.frames.results.map((frame) => frame.id) || []
      );

      setSelectedFrames((prev) => {
        const newSet = new Set(prev);
        if (isSelected) {
          frameIds.forEach((id) => newSet.add(id));
        } else {
          frameIds.forEach((id) => newSet.delete(id));
        }
        return newSet;
      });
    }
  };

  const handleFrameSelect = (frameId: number, isSelected: boolean) => {
    setSelectedFrames((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(frameId);
      } else {
        newSet.delete(frameId);
      }
      return newSet;
    });

    if (!isSelected && modalData) {
      const folderKey = `untrained-${modalData.results[0]?.id.toString()}`;
      setSelectedFolders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderKey);
        return newSet;
      });
    }
  };

  const handleAllFramesSelect = (
    frameIds: Array<number>,
    isSelected: boolean
  ) => {
    setSelectedFrames((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        frameIds.forEach((id) => newSet.add(id));
      } else {
        frameIds.forEach((id) => newSet.delete(id));
      }
      return newSet;
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;
  if (!data || data.untrained.results.length === 0) {
    return <div>No data available</div>;
  }

  const untrainedData = data.untrained;

  const handleSelectAll = (isSelected: boolean) => {
    if (!modalData) return;

    setSelectedFolders((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        data.untrained.results.forEach((folder) => {
          newSet.add(`untrained-${folder.date}`);
        });
      } else {
        data.untrained.results.forEach((folder) => {
          newSet.delete(`untrained-${folder.date}`);
        });
      }
      return newSet;
    });

    const allFrameIds = modalData.results.flatMap(
      (file) => file.frames?.results.map((frame) => frame.id) || []
    );

    setSelectedFrames((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        allFrameIds.forEach((id) => newSet.add(id));
      } else {
        allFrameIds.forEach((id) => newSet.delete(id));
      }
      return newSet;
    });
  };

  const allFoldersSelected =
    data.untrained.results.length > 0 &&
    data.untrained.results.every((folder) =>
      selectedFolders.has(`untrained-${folder.date}`)
    );

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
              checked={allFoldersSelected}
              onChange={(e) => {
                handleSelectAll(e.target.checked);
              }}
            />
            <span>Select all</span>
          </div>
        </div>
      </div>

      <OCRMediaFolders
        data={{
          trained: {
            results: [],
            pagination_data: {
              count: 0,
              next: null,
              previous: null,
              page_size: 0,
              current_page: 1,
              total_pages: 1,
            },
          },
          untrained: untrainedData,
        }}
        onFolderClick={(type, date) => {
          void handleFolderClick(type, date);
        }}
        selectedFolders={selectedFolders}
        onFolderSelect={handleFolderSelect}
        // loading={false}
      />

      {isFolderLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg">
            <CircularLoader />
            <p>Loading folder data...</p>
          </div>
        </div>
      )}

      {modalOpen && modalData && (
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
          isPending={isPending || isRefetching}
          selectedFrames={selectedFrames}
          onFrameSelect={handleFrameSelect}
          onAllFramesSelect={handleAllFramesSelect}
          isTrained={false}
        />
      )}

      <div className="mt-6" ref={ref}>
        {hasNextPage && isFetchingNextPage && (
          <div className="flex justify-center items-center">
            <div className="w-10 h-10">
              <CircularLoader />
            </div>
          </div>
        )}
        {!hasNextPage &&
          allResults.length > 0 &&
          !isFetchingNextPage &&
          modalOpen && (
            <p className="text-center text-gray-500 py-4">No more data.</p>
          )}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl space-y-3 relative">
            <OCRMediaUploadMediaModal
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

      {isMediaModalOpen && ocrModalData && (
        <Modal>
          <OCRUrduMediaModal
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

export default OCRMediaUntrainedData;
