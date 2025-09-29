import { twMerge } from "tailwind-merge";

type Props = Readonly<{
  name: string;
  isChecked: boolean;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  count: number;
  disabled?: boolean;
  onFolderClick: () => void;
}>;

function Folder(props: Props) {
  return (
    <div
      className={twMerge(
        "relative px-3 py-2",
        props.isChecked && "bg-gray-100 rounded-md",
        props.disabled && "opacity-50 cursor-not-allowed bg-transparent"
      )}
    >
      <div className="absolute flex items-center top-2 left-2">
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer accent-indigo-500"
          checked={props.isChecked}
          onChange={props.onCheckboxChange}
        />
      </div>
      <div className="absolute flex items-center justify-center h-4 text-xs px-0.5 text-indigo-600 border border-indigo-600 min-w-4 top-2 right-2">
        {props.count}
      </div>
      <div
        className={twMerge(
          "w-full cursor-pointer",
          "flex flex-col items-center",
          "text-indigo-400 hover:text-indigo-500",
          props.isChecked && "text-red-500 hover:text-red-600",
          props.disabled && "text-gray-400 hover:text-gray-400"
        )}
        onClick={props.onFolderClick}
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 256 256"
          width="100%"
        >
          <path d="M245,110.64A16,16,0,0,0,232,104H216V88a16,16,0,0,0-16-16H130.67L102.94,51.2a16.14,16.14,0,0,0-9.6-3.2H40A16,16,0,0,0,24,64V208h0a8,8,0,0,0,8,8H211.1a8,8,0,0,0,7.59-5.47l28.49-85.47A16.05,16.05,0,0,0,245,110.64ZM93.34,64,123.2,86.4A8,8,0,0,0,128,88h72v16H69.77a16,16,0,0,0-15.18,10.94L40,158.7V64Z"></path>
        </svg>
        <p
          className="text-sm text-center text-gray-600 break-words line-clamp-2"
          title={props.disabled ? `${props.name} (disabled)` : props.name}
        >
          {props.name}
        </p>
      </div>
    </div>
  );
}

export default Folder;
