import { PiFolderOpenFill } from "react-icons/pi";
import { TickerDataGroupType } from "../../../api/useGetTfProcessedImages.types";

type TickerProps = {
  data: Array<TickerDataGroupType>;
  onFolderClick: (folder: TickerDataGroupType) => void;
  selectedIds: Array<number>;
  onFolderCheckboxToggle: (
    folder: TickerDataGroupType,
    checked: boolean
  ) => void;
  isTrained?: boolean;
};

export const TickerFolders = ({
  data,
  onFolderClick,
  selectedIds,
  onFolderCheckboxToggle,
  isTrained,
}: TickerProps) => {
  return (
    <ul className="grid grid-cols-4 gap-7">
      {data.map((item, index) => {
        const allSelected = item.images.every((img) =>
          selectedIds.includes(img.image_id)
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
                  item.images.some((img) => selectedIds.includes(img.image_id))
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
