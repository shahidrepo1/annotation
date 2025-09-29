import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { SentimentTrainedData } from "./SentimentTrainedData";
import { SentimentUntrainedData } from "./SentimentUntrainedData";
import { SentimentViewAll } from "./SentimentViewAll";
import useGetSentiments from "../../../api/useGetSentiments";
import { useState } from "react";

const SentimentTabs = () => {
  const tabs = ["ViewAll", "TrainedData", "UntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("active") || "ViewAll";
  const searchTerm = searchParams.get("date") || "";
  const [mediaType, setMediaType] = useState<
    "all" | "audio" | "video" | "document"
  >("all");

  // ✅ new: lift selected state here
  const [trainedSelected, setTrainedSelected] = useState<Array<number>>([]);
  const [untrainedSelected, setUntrainedSelected] = useState<Array<number>>([]);

  const { data, isLoading } = useGetSentiments();
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      date: e.target.value || "",
      active: activeTab,
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: tab,
      date: searchTerm,
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

      <div className="flex items-center justify-between rounded-lg p-5 border-indigo-300">
        <div className="flex-1 flex justify-center">
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

        <div>
          <select
            value={mediaType}
            onChange={(e) => {
              setMediaType(
                e.target.value as "all" | "audio" | "video" | "document"
              );
            }}
            className="border border-gray-400 rounded-md p-2"
          >
            <option value="all">All</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white-100 rounded shadow">
        {activeTab === "ViewAll" && data && (
          <SentimentViewAll
            data={data}
            mediaType={mediaType}
            trainedSelected={trainedSelected}
            setTrainedSelected={setTrainedSelected}
            untrainedSelected={untrainedSelected}
            setUntrainedSelected={setUntrainedSelected}
          />
        )}
        {activeTab === "TrainedData" && data && (
          <SentimentTrainedData
            data={data}
            mediaType={mediaType}
            selectedChunkIds={trainedSelected}
            setSelectedChunkIds={setTrainedSelected}
          />
        )}
        {activeTab === "UntrainedData" && data && (
          <SentimentUntrainedData
            data={data}
            mediaType={mediaType}
            selectedChunkIds={untrainedSelected}
            setSelectedChunkIds={setUntrainedSelected}
          />
        )}
      </div>
    </div>
  );
};

export default SentimentTabs;
