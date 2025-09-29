import { PiFolderOpenFill } from "react-icons/pi";

type FolderListProps = {
  folders: Array<string>;
  onSelectFolder: (folder: string) => void;
};

export default function FolderList({
  folders,
  onSelectFolder,
}: FolderListProps) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mt-8">
      {folders.map((name) => (
        <li key={name} className="flex flex-col items-center">
          <PiFolderOpenFill
            className="text-9xl text-indigo-500 hover:text-indigo-500 cursor-pointer"
            onClick={() => {
              onSelectFolder(name);
            }}
          />
          <div className="text-center">{name}</div>
        </li>
      ))}
    </ul>
  );
}
