import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { OCRMediaTrainedData } from "./OCRMediaUrduTrainedData";
import { OCRMediatViewAll } from "./OCRMediaUrduViewAll";
import { OCRMediaUntrainedData } from "./OCRMediaUrduUntrainedData";
import { useState } from "react";

const OCRMediaTabs = () => {
  const tabs = ["ViewAll", "TrainedData", "UntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("active") || "ViewAll";
  const searchTerm = searchParams.get("datee") || "";
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(
    new Set()
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      datee: e.target.value || "",
      active: activeTab,
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: tab,
      datee: searchTerm,
    });
  };

  return (
    <div className="w-full p-4">
      <div className="relative w-full">
        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          className="w-full border border-gray-400 p-2 pl-10 rounded-md outline-none"
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex border-indigo-300 justify-center rounded-lg p-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-4 px-5 text-black font-medium focus:outline-none bg-indigo-200 hover:text-indigo-700 ${
              activeTab === tab ? "border-b-2 border-indigo-600" : ""
            }`}
            onClick={() => {
              handleTabChange(tab);
            }}
          >
            {tab
              .replace(/^stt/, "")
              .replace(/([A-Z])/g, " $1")
              .trim()}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-white-100 rounded shadow">
        {activeTab === "ViewAll" && (
          <OCRMediatViewAll
            selectedFolders={selectedFolders}
            setSelectedFolders={setSelectedFolders}
          />
        )}
        {activeTab === "TrainedData" && (
          <OCRMediaTrainedData
            selectedFrames={new Set<number>()}
            setSelectedFrames={() => {}}
            selectedFolders={selectedFolders}
            setSelectedFolders={setSelectedFolders}
          />
        )}
        {activeTab === "UntrainedData" && (
          <OCRMediaUntrainedData
            selectedFrames={new Set<number>()}
            setSelectedFrames={() => {}}
            selectedFolders={selectedFolders}
            setSelectedFolders={setSelectedFolders}
          />
        )}
      </div>
    </div>
  );
};

export default OCRMediaTabs;

export type status = "TrainedData" | "UntrainedData" | "ViewAll";
