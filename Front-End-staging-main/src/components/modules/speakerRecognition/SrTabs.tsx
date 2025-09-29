import useGetAllAudioChunks from "../../../api/useGetAllAudioChunks";
import { ViewAll } from "../speakerRecognition/ViewAll";
import { TrainedData } from "../speakerRecognition/TrainedData";
import { UntrainedData } from "../speakerRecognition/UntrainedData";
import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

const Tabs = () => {
  const tabs = ["ViewAll", "TrainedData", "UntrainedData"];
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = useGetAllAudioChunks();
  const activeTab = searchParams.get("active") || "ViewAll";
  const searchTerm = searchParams.get("speaker") || "";

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
      speaker: e.target.value || "",
      active: activeTab,
    });
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      active: tab,
      speaker: searchTerm,
    });
  };

  return (
    <div className="w-full p-4">
      <div className="relative w-full">
        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          className="w-full border border-gray-400 p-2 pl-10 rounded-md outline-none "
          type="search"
          placeholder="Search Speaker"
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
            {tab.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>

      {data && (
        <div className="mt-4 p-4 bg-white-100 rounded shadow">
          {activeTab === "ViewAll" && <ViewAll data={data} />}
          {activeTab === "TrainedData" && (
            <TrainedData data={data} status="trained" />
          )}
          {activeTab === "UntrainedData" && (
            <UntrainedData data={data} status="untrained" />
          )}
        </div>
      )}
    </div>
  );
};

export default Tabs;

export type status = "trained" | "untrained" | "view all";
