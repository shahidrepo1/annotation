import { useInfiniteQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getOcrDocDataByDate } from "./apiConstants";
import { DocDataResponse } from "./useGetOCRDocByDate.types";

function useGetOCRUrduDocByDate() {
  const axiosInstance = useAxiosPrivate();

  return useInfiniteQuery({
    queryKey: ["docByDate"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get<DocDataResponse>(
        `${getOcrDocDataByDate}?page=${pageParam.toString()}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (
        lastPage.trained.pagination_data.current_page <
        lastPage.trained.pagination_data.total_pages
      ) {
        return lastPage.trained.pagination_data.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export default useGetOCRUrduDocByDate;
