import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import useGetOdTrainedData from "../../../api/useGetOdTrainData";
import { ODModel } from "../../../api/useGetOdTrainedData.types";

type VersionListProps = {
  onSelectVersion: (dailyVersion: ODModel | null) => void;
};

export const ObjectDetectionVersion = ({
  onSelectVersion,
}: VersionListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null
  );
  const { data, isPending, isError } = useGetOdTrainedData();

  const filteredData =
    Array.isArray(data) && data.length > 0
      ? data.filter((version: ODModel) =>
          `Version ${version.version}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : [];
  return (
    <>
      <aside className="h-[86vh] text-indigo-400 p-4 overflow-auto w-64 border border-indigo-500 rounded-md">
        <ul className="space-y-2">
          <li
            onClick={() => {
              onSelectVersion(null);
              setSelectedVersionId(null);
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
            filteredData.map((version: ODModel) => (
              <li
                key={version.id}
                className={`p-2 cursor-pointer rounded border border-indigo-500 hover:bg-indigo-500 hover:text-white ${
                  selectedVersionId === version.id
                    ? "bg-indigo-500 text-white"
                    : ""
                }`}
                onClick={() => {
                  onSelectVersion(version);
                  setSelectedVersionId(version.id);
                }}
              >
                Version {version.version}
              </li>
            ))}

          {!isPending && !isError && filteredData.length === 0 && (
            <li className="text-gray-500 italic">No versions found</li>
          )}
        </ul>
      </aside>
    </>
  );
};
