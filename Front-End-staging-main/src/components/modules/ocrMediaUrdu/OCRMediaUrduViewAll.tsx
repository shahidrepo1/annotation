import { useState } from "react";
import { OCRMediaTrainedData } from "./OCRMediaUrduTrainedData";
import OCRMediaUntrainedData from "./OCRMediaUrduUntrainedData";
import useOCRMediaTrainModel from "../../../api/useOCRUrduMediaTrain";
import { toast } from "react-toastify";
import { queryClient } from "../../../main";

type Props = {
  selectedFolders: Set<string>;
  setSelectedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const OCRMediatViewAll = ({
  selectedFolders,
  setSelectedFolders,
}: Props) => {
  const [trainedSelected, setTrainedSelected] = useState<Set<number>>(
    new Set()
  );
  const [untrainedSelected, setUntrainedSelected] = useState<Set<number>>(
    new Set()
  );

  const { mutate: trainModel, isPending } = useOCRMediaTrainModel();

  const handleStartTraining = () => {
    trainModel(
      {
        submoduleName: "UrduMedia",
        moduleName: "OCR",
        forTrain: Array.from(untrainedSelected),
        forUntrain: Array.from(trainedSelected),
      },
      {
        onSuccess: () => {
          toast.success("Training started successfully!");
          setTrainedSelected(new Set());
          setUntrainedSelected(new Set());
          setSelectedFolders(new Set());
          void queryClient.invalidateQueries({ queryKey: ["OcrMedia"] });
          void queryClient.invalidateQueries({ queryKey: ["ocrFolders"] });
          void queryClient.invalidateQueries({
            queryKey: ["ocrUrduTrainModel"],
          });
        },
        onError: () => {
          toast.error("Failed to start training");
        },
      }
    );
  };
  const hasAnySelected = trainedSelected.size > 0 || untrainedSelected.size > 0;

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto overflow-x-hidden">
        <div>
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <OCRMediaTrainedData
              selectedFrames={trainedSelected}
              setSelectedFrames={setTrainedSelected}
              selectedFolders={selectedFolders}
              setSelectedFolders={setSelectedFolders}
            />
          </div>
        </div>

        <div>
          <div className="grid bg-slate-100 p-3 rounded-md min-h-[60vh]">
            <OCRMediaUntrainedData
              selectedFrames={untrainedSelected}
              setSelectedFrames={setUntrainedSelected}
              selectedFolders={selectedFolders}
              setSelectedFolders={setSelectedFolders}
            />
          </div>
        </div>
      </div>

      {hasAnySelected && (
        <div className="sticky bottom-0 flex justify-center mt-4 bg-white py-2">
          <button
            className={`bg-indigo-600 text-white py-2 px-4 rounded mx-auto ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleStartTraining}
            disabled={isPending}
          >
            {isPending ? "Training..." : "Start Training"}
          </button>
        </div>
      )}
    </>
  );
};
