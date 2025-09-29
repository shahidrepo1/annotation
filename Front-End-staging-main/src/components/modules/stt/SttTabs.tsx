import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import SttViewAll from "./sttViewAll";
import SttTrainedData from "./SttTrainedData";
import SttUntrainedData from "./SttUntrainedData";

const SttTabs = () => {
  const tabs = ["sttViewAll", "sttTrainedData", "sttUntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("active") || "sttViewAll";
  const searchTerm = searchParams.get("transcription") || "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: activeTab,
      transcription: e.target.value || "",
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: tab,
      transcription: searchTerm,
    });
  };

  return (
    <div className="w-full p-4">
      <div className="relative w-full">
        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          className="w-full border border-gray-400 p-2 pl-10 rounded-md outline-none"
          type="search"
          placeholder="Search Transcription"
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
        {activeTab === "sttViewAll" && <SttViewAll />}
        {activeTab === "sttTrainedData" && <SttTrainedData />}
        {activeTab === "sttUntrainedData" && <SttUntrainedData />}
      </div>
    </div>
  );
};

export default SttTabs;

export type status = "sttTrained" | "sttUntrained" | "SttViewall";
