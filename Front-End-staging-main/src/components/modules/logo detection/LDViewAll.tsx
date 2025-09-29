// import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LDTrainedData } from "./LDTrainedData";
import { LDUntrainedData } from "./LDUntrainedData";
import useLogoTrainModel from "../../../api/useLogoTrainModel";
import {
  ImageType,
  LogoDetectionDataType,
} from "../../../api/useGetLogoData.types";
import { useSearchParams } from "react-router";

type Props = {
  data: LogoDetectionDataType;
  onFolderClick: (folder: { date: string; data: Array<ImageType> }) => void;
  selectedIds: Array<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Array<number>>>;
};

export const LDViewAll = ({
  data,
  onFolderClick,
  selectedIds,
  setSelectedIds,
}: Props) => {
  const { mutate, isPending } = useLogoTrainModel();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStartTraining = () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one image to train.");
      return;
    }
    const forTrain: Array<number> = [];
    const forUntrain: Array<number> = [];

    data.results.untrainedData.forEach((group) => {
      group.data.forEach((image) => {
        const matched = image.labels
          .filter((label) => selectedIds.includes(label.id))
          .map((label) => label.id);
        if (matched.length > 0) {
          forTrain.push(...matched);
        }
      });
    });

    data.results.trainedData.forEach((group) => {
      group.data.forEach((image) => {
        const matched = image.labels
          .filter((label) => selectedIds.includes(label.id))
          .map((label) => label.id);
        if (matched.length > 0) {
          forUntrain.push(...matched);
        }
      });
    });

    const payload = {
      moduleName: "LOGO",
      forTrain,
      forUntrain,
      reTrain: {},
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Training started successfully!");
        void queryClient.invalidateQueries({
          queryKey: ["LogoAnnotatedImage"],
        });
        void queryClient.invalidateQueries({ queryKey: ["LogoTrainedData"] });
        void queryClient.invalidateQueries({ queryKey: ["LogoLabel"] });
        setSelectedIds([]);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError<Record<string, string>>(error)) {
          const err = error.response?.data;

          toast.warning(err?.error ?? "Training failed. Please try again.");
        }
      },
    });
  };

  return (
    <>
      <div className="w-full max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
              <LDTrainedData
                data={data}
                onFolderClick={onFolderClick}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
              <LDUntrainedData
                data={data}
                onFolderClick={onFolderClick}
                onUploadClick={() => {}}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded mx-auto text-center"
            onClick={handleStartTraining}
          >
            {isPending ? "Training..." : "Start Training"}
          </button>
        </div>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          disabled={!data.pagination_data.previous}
          onClick={() => {
            const prevPage = data.pagination_data.current_page - 1;
            setSearchParams({
              ...Object.fromEntries(searchParams),
              page: String(prevPage),
            });
          }}
          className={`px-3 py-1 rounded border ${
            !data.pagination_data.previous
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          Previous
        </button>

        <span>
          Page {data.pagination_data.current_page} of{" "}
          {data.pagination_data.total_pages}
        </span>

        <button
          disabled={!data.pagination_data.next}
          onClick={() => {
            const nextPage = data.pagination_data.current_page + 1;
            setSearchParams({
              ...Object.fromEntries(searchParams),
              page: String(nextPage),
            });
          }}
          className={`px-3 py-1 rounded border ${
            !data.pagination_data.next ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
};
