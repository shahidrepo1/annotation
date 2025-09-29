import { Model } from "../../../api/useSentimentTrainedData.types";
import { SentimentTrainingFolders } from "./SentimentTrainingFolders";
export default function SentimentTrainingData({
  selectedVersion,
}: {
  selectedVersion: Model;
}) {
  return (
    <div className="p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-white p-6 shadow-md rounded m-3">
        <h3 className="text-md font-semibold text-indigo-500">
          Version:
          {selectedVersion.version}
        </h3>
        <h1 className="text-2xl font-bold">Version Details</h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Version Name:</strong>
            <p>{selectedVersion.version}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Id:</strong>
            <p>{selectedVersion.id}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>User:</strong>
            <p>{selectedVersion.user}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Model Name:</strong>
            <p>{selectedVersion.model_name}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Module Name:</strong>
            <p>{selectedVersion.module_name}</p>
          </div>

          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Epoch:</strong>
            <p>{selectedVersion.epoch}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Total Epochs:</strong>
            <p>{selectedVersion.total_epochs}</p>
          </div>

          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Created At:</strong>
            <p>{selectedVersion.created_at}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50 col-span-3">
            <strong>Status:</strong>
            <p
              className={
                selectedVersion.status
                  ? "text-green-500 font-bold"
                  : "text-red-500 font-bold"
              }
            >
              {selectedVersion.status ? "Completed" : "Failed"}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full space-x-3">
        <div className="bg-white p-6 shadow rounded m-3">
          <h3 className="text-2xl font-bold mb-4">Trained Data</h3>
          <SentimentTrainingFolders data={selectedVersion} />
        </div>
      </div>
    </div>
  );
}
