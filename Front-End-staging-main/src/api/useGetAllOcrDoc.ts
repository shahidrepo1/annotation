import { useInfiniteQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getAllOcrDocData } from "./apiConstants";
import { useSearchParams } from "react-router";
import { OCRDocsResponse } from "./useGetAllOCRDoc.types";

function useGetAllOCRDoc() {
  const axiosInstance = useAxiosPrivate();
  const [searchParams] = useSearchParams();

  const date = searchParams.get("date");
  const type = searchParams.get("type");

  return useInfiniteQuery<OCRDocsResponse>({
    queryKey: ["OcrDocument", type, date],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get<OCRDocsResponse>(
        getAllOcrDocData,
        {
          params: {
            type,
            date,
            page: pageParam,
          },
        }
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination_data.current_page;
      const totalPages = lastPage.pagination_data.total_pages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    refetchInterval: 5000,
    enabled: !!type && !!date,
    staleTime: 0,
    gcTime: 1000 * 60,
  });
}

export default useGetAllOCRDoc;
