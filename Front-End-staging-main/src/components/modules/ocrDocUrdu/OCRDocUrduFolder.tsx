import { PiFolderOpenFill } from "react-icons/pi";
import { useSearchParams } from "react-router-dom";

type Folder = {
  type: "trained" | "untrained";
  date: string;
  count: number;
};

type Props = {
  folders: Array<Folder>;
  onOpenModal: () => void;
};

export const OCRDocUrduFolder = ({ folders, onOpenModal }: Props) => {
  const [, setSearchParams] = useSearchParams();

  const handleClick = (folder: Folder) => {
    setSearchParams({ type: folder.type, date: folder.date });
    onOpenModal(); // open modal after setting params
  };

  return (
    <ul className="grid grid-cols-4 gap-7">
      {folders.map((folder, index) => (
        <li
          key={index}
          className="relative flex flex-col items-center cursor-pointer"
          onClick={() => {
            handleClick(folder);
          }}
        >
          <div className="relative">
            <div className="absolute top-[-8px] left-[3px] flex items-center">
              <input type="checkbox" className="w-4 h-4 cursor-pointer" />
            </div>

            <div className="absolute top-[-8px] right-[-8px] text-xs w-6 h-6 flex items-center justify-center border border-indigo-600 text-indigo-600">
              {folder.count}
            </div>

            <PiFolderOpenFill className="text-8xl text-indigo-400 hover:text-indigo-500" />
          </div>

          <p className="mt-2 text-center text-sm text-gray-600">
            {folder.date}
          </p>
        </li>
      ))}
    </ul>
  );
};
