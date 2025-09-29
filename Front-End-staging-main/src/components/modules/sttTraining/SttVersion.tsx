import { useState } from "react";
import useGetSttTrainedData from "../../../api/useGetSttTrainedData";
import {
  DailyVersionType,
  VersionType,
} from "../../../api/useGetSttTrainedData.types";
import { CiSearch } from "react-icons/ci";

type VersionListProps = {
  onSelectVersion: (dailyVersion: DailyVersionType | null) => void;
};

export default function SttVersion({ onSelectVersion }: VersionListProps) {
  const { data, isPending, isError } = useGetSttTrainedData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVersionKey, setSelectedVersionKey] = useState<string | null>(
    null
  );

  const filteredData =
    data?.filter((daily) =>
      daily.versions.some((version) =>
        `Version ${version.version_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    ) || [];

  return (
    <aside className="h-[86vh] text-indigo-400 p-4 overflow-auto w-64 border border-indigo-500 rounded-md">
      <ul className="space-y-2">
        <li
          onClick={() => {
            onSelectVersion(null);
            setSelectedVersionKey(null);
          }}
          className="cursor-pointer"
        >
          <span className="text-black font-bold text-2xl">Dashboard</span>
          <div className="relative w-full mt-2">
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
            <input
              type="search"
              className="w-full rounded-2xl pl-10 pr-3 py-2 placeholder:text-sm placeholder:font-normal placeholder:text-white text-sm outline-none text-white font-normal bg-indigo-400"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </li>

        {isPending && (
          <li className="text-gray-500 italic">Loading versions...</li>
        )}

        {isError && (
          <li className="text-red-600 italic">Failed to load versions</li>
        )}

        {!isPending &&
          !isError &&
          filteredData.flatMap((daily: DailyVersionType) =>
            daily.versions.map((version: VersionType) => {
              const versionKey = `${daily.date}-${version.version_name}`;
              const isSelected = selectedVersionKey === versionKey;

              return (
                <li
                  key={versionKey}
                  className={`p-2 cursor-pointer rounded border border-indigo-500 hover:bg-indigo-500 hover:text-white ${
                    isSelected ? "bg-indigo-500 text-white" : ""
                  }`}
                  onClick={() => {
                    onSelectVersion({
                      date: daily.date,
                      versions: [version],
                    });
                    setSelectedVersionKey(versionKey);
                  }}
                >
                  Version {version.version_name}
                </li>
              );
            })
          )}

        {!isPending && !isError && filteredData.length === 0 && (
          <li className="text-gray-500 italic">No versions found</li>
        )}
      </ul>
    </aside>
  );
}
