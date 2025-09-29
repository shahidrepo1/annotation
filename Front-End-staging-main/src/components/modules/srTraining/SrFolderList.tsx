import { FaFolder } from "react-icons/fa";
import { SpeakerData } from "../../../api/useGetAllAudioChunks.types";

type FolderListProps = {
  data: SpeakerData;
  title: string;
  onFolderClick: (speaker: string) => void;
};

function SrFolderList({ data, title, onFolderClick }: FolderListProps) {
  return (
    <section className="mt-4">
      <h1 className="text-indigo-500 font-bold text-xl ">{title}</h1>
      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
        {data.map((item) => (
          <li key={item.speaker} className="flex flex-col items-center">
            <FaFolder
              className="text-9xl text-indigo-400 hover:text-indigo-500 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => {
                onFolderClick(item.speaker);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onFolderClick(item.speaker);
                }
              }}
            />
            <div className="text-center mt-2">{item.speaker}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SrFolderList;
