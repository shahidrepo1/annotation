import { ModelType } from "../../../api/useGetFrTrainedData.types";
import { FrTrainingFolders } from "./FrTrainingFolders";
export default function FrTrainingData({
  selectedVersion,
}: {
  selectedVersion: ModelType;
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
            <strong>Id:</strong>
            <p>{selectedVersion.id}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Model Name:</strong>
            <p>{selectedVersion.modelName}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Epoch:</strong>
            <p>{selectedVersion.epoch}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Total Epochs:</strong>
            <p>{selectedVersion.totalEpochs}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Created At:</strong>
            <p>{selectedVersion.createdAt}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50 col-span-3">
            <strong>Completed:</strong>
            <p>{selectedVersion.status}</p>
          </div>
        </div>
      </div>

      <div className="w-full space-x-3">
        <div className="bg-white p-6 shadow rounded m-3">
          <h3 className="text-2xl font-bold mb-4">Trained Data</h3>
          <FrTrainingFolders data={selectedVersion} />
        </div>
      </div>
    </div>
  );
}
