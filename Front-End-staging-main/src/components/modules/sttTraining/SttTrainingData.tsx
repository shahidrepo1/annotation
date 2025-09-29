import { DailyVersionType } from "../../../api/useGetSttTrainedData.types";
import { SttTrainingFolders } from "./SttTrainingFolders";
export default function SttTrainingData({
  selectedVersion,
}: {
  selectedVersion: DailyVersionType;
}) {
  const allProgress = selectedVersion.versions.flatMap(
    (version) => version.progress
  );

  if (!allProgress.length) {
    return <div>No progress data available</div>;
  }

  return (
    <div className="p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-white p-6 shadow-md rounded m-3">
        <h3 className="text-md font-semibold text-indigo-500">
          Version:
          {selectedVersion.versions.map((v) => v.version_name).join(", ")}
        </h3>
        <h1 className="text-2xl font-bold">Version Details</h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Id:</strong>
            <p>{allProgress.map((p) => p.id).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Version Name:</strong>
            <p>
              {selectedVersion.versions.map((v) => v.version_name).join(", ")}
            </p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>User:</strong>
            <p>{allProgress.map((p) => p.user).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Module Name:</strong>
            <p>
              {selectedVersion.versions.map((v) => v.version_module).join(", ")}
            </p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Model Name:</strong>
            <p>{allProgress.map((p) => p.model_name).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Epoch:</strong>
            <p>{allProgress.map((p) => p.epoch).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Total Epochs:</strong>
            <p>{allProgress.map((p) => p.total_epochs).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>F1 Score:</strong>
            <p>{allProgress.map((p) => p.f1_score).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Created At:</strong>
            <p>{allProgress.map((p) => p.created_at).join(", ")}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50 col-span-3">
            <strong>Completed:</strong>
            <p>{allProgress.some((p) => p.is_completed) ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>

      <div className="w-full space-x-3">
        <div className="bg-white p-6 shadow rounded m-3">
          <h3 className="text-2xl font-bold mb-4">Trained Data</h3>
          <SttTrainingFolders data={selectedVersion} />
        </div>
      </div>
    </div>
  );
}
