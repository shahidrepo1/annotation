import { useState } from "react";
import useGetOCRUrduDocByDate from "../../../api/useGetOCRUrduDocByDate";
import { OCRDocUrduFolder } from "./OCRDocUrduFolder";
import { OCRDocUrduFolderModal } from "./OCRDocUrduFolderModal";
import CircularLoader from "../ocrMediaUrdu/OCRMediaUrduFolders";

export const OCRDocUrduTrainedData = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetOCRUrduDocByDate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return <CircularLoader />;
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
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-bold text-xl p-3">Trained Data</h1>
        <div className="flex items-center">
          <input type="checkbox" className="mr-2 text-sm cursor-pointer" />
          <span>Select all</span>
        </div>
      </div>

      <OCRDocUrduFolder
        folders={folders}
        onOpenModal={() => setIsModalOpen(true)}
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
        <OCRDocUrduFolderModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
