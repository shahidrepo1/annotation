import { useState, useEffect } from "react";
import { OCRMediaFolders } from "./OCRMediaUrduFolders";
import useGetOCRUrduMediByDate from "../../../api/useGetOCRUrduMediByDate";
import useGetAllOCRMedia from "../../../api/useGetAllOCRMedia";
import { OCRUrduMediaFolderModal } from "./OCRMediaUrduFolderModal";
import type { OCRMediaData } from "../../../api/useGetAllOCRMedia.types";
import { useSearchParams } from "react-router";
import CircularLoader from "../../primitives/CircularLoader";

type Props = {
  selectedFrames: Set<number>;
  setSelectedFrames: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectedFolders: Set<string>;
  setSelectedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
};
export const OCRMediaTrainedData = ({
  selectedFrames,
  setSelectedFrames,
  selectedFolders = new Set(),
  setSelectedFolders,
}: Props) => {
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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<OCRMediaData | null>(null);
  const [, setSearchParams] = useSearchParams();
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [clickedFolder, setClickedFolder] = useState<{
    type: string;
    date: string;
  } | null>(null);
  const [folderFrames, setFolderFrames] = useState<
    Record<string, Array<number>>
  >({});

  useEffect(() => {
    if (paginatedData && clickedFolder && !isPending && !isRefetching) {
      const results = paginatedData.pages.flatMap((page) => page.results);

      setModalData({
        results,
        pagination_data:
          paginatedData.pages[paginatedData.pages.length - 1].pagination_data,
      });

      // ✅ store frame IDs in folderFrames
      const frameIds = results.flatMap(
        (file) => file.frames?.results.map((frame) => frame.id) || []
      );
      setFolderFrames((prev) => ({
        ...prev,
        [`${clickedFolder.type}-${clickedFolder.date}`]: frameIds,
      }));

      setModalOpen(true);
      setIsFolderLoading(false);
      setClickedFolder(null);
    }
  }, [paginatedData, isPending, isRefetching, clickedFolder]);

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
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;
  if (!data || data.trained.results.length === 0) {
    return <div>No trained data available</div>;
  }
  const handleFolderSelect = (
    type: string,
    date: string,
    isSelected: boolean
  ) => {
    setSelectedFolders((prev) => {
      const newSet = new Set(prev);
      const folderKey = `${type}-${date}`;
      if (isSelected) newSet.add(folderKey);
      else newSet.delete(folderKey);
      return newSet;
    });

    const frameIds = folderFrames[`${type}-${date}`] || [];
    setSelectedFrames((prev) => {
      const newSet = new Set(prev);
      if (isSelected) frameIds.forEach((id) => newSet.add(id));
      else frameIds.forEach((id) => newSet.delete(id));
      return newSet;
    });
  };

  // const handleModalOpen = (type: string, date: string) => {
  //   setModalData(null);
  //   setIsNewFolderLoading(true);
  //   setModalOpen(true);
  //   setSearchParams({ type, date });
  // };
  const handleFrameSelect = (frameId: number, isSelected: boolean) => {
    setSelectedFrames((prev) => {
      const newSet = new Set(prev);
      if (isSelected) newSet.add(frameId);
      else newSet.delete(frameId);
      return newSet;
    });
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

  const handleSelectAll = (isSelected: boolean) => {
    if (!modalData) return;

    setSelectedFolders((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        data.trained.results.forEach((folder) => {
          newSet.add(`trained-${folder.date}`);
        });
      } else {
        data.trained.results.forEach((folder) => {
          newSet.delete(`trained-${folder.date}`);
        });
      }
      return newSet;
    });

    const allFrameIds = modalData.results.flatMap((file) =>
      file.frames?.results.map((frame) => frame.id)
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
    data.trained.results.length > 0 &&
    data.trained.results.every((folder) =>
      selectedFolders.has(`trained-${folder.date}`)
    );
  return (
    <div className="w-full space-x-3">
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-bold text-xl p-3">Trained Data</h1>
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

      <OCRMediaFolders
        data={{
          trained: data.trained,
          untrained: {
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
        }}
        onFolderClick={(type, date) => {
          void handleFolderClick(type, date);
        }}
        selectedFolders={selectedFolders}
        onFolderSelect={handleFolderSelect}
      />
      {isFolderLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center gap-4 min-w-[200px]">
            <CircularLoader />
            <p className="text-gray-700">Loading folder data...</p>
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
          fetchNextPage={() => void fetchNextPage()}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          selectedFrames={selectedFrames}
          onFrameSelect={handleFrameSelect}
          onAllFramesSelect={handleAllFramesSelect}
          isTrained={true}
        />
      )}
    </div>
  );
};
