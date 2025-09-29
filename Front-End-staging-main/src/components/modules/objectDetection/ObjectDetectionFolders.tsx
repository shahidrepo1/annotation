import { PiFolderOpenFill } from "react-icons/pi";
import { OdLabeledImageGroup } from "../../../api/useGetOdProcessedImages.types";

type Props = {
  data: Array<OdLabeledImageGroup>;
  onFolderClick: (folder: OdLabeledImageGroup) => void;
  selectedIds: Array<number>;
  onFolderCheckboxToggle: (
    folder: OdLabeledImageGroup,
    checked: boolean
  ) => void;
  isTrained?: boolean;
};

export const ObjectDetectionFolders = ({
  data,
  onFolderClick,
  selectedIds,
  onFolderCheckboxToggle,
  isTrained,
}: Props) => {
  return (
    <ul className="grid grid-cols-4 gap-7">
      {data?.map((item, index) => {
        const allDetectionIds = item.images.flatMap((img) =>
          img.detections?.map((det) => det.detection_id)
        );

        const allSelected = allDetectionIds.every((id) =>
          selectedIds.includes(id)
        );

        return (
          <li key={index} className="relative flex flex-col items-center">
            <div className="relative">
              <div className="absolute top-[-8px] left-[3px] flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={allSelected}
                  onChange={(e) => {
                    onFolderCheckboxToggle(item, e.target.checked);
                  }}
                />
              </div>
              <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
                {item.images.length}
              </div>
              <PiFolderOpenFill
                className={`text-8xl ${
                  isTrained &&
                  item.images.some((img) =>
                    selectedIds.includes(img.detections[0].detection_id)
                  )
                    ? "text-red-500 hover:text-red-600"
                    : "text-indigo-400 hover:text-indigo-500"
                } hover:text-indigo-500 cursor-pointer`}
                onClick={() => {
                  onFolderClick(item);
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {item.label}
            </p>
          </li>
        );
      })}
    </ul>
  );
};

export default ObjectDetectionFolders;
