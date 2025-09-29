import { SrTrainedDataObjectType } from "../../../api/useGetSrTrainedData.types";
import TrainedData from "../speakerRecognition/TrainedData";

type SrTrainedDataProps = {
  selectedVersion: SrTrainedDataObjectType;
};

export default function SrTrainedData({ selectedVersion }: SrTrainedDataProps) {
  return (
    <div className="p-6 bg-gray-100 overflow-y-auto">
      <div className="bg-white p-6 shadow-md rounded m-3">
        <h3 className="text-md font-semibold text-indigo-500">
          Version {selectedVersion.version_name}
        </h3>
        <h1 className="text-2xl font-bold">Version Details</h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Id:</strong>
            <p>{selectedVersion.id}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Version Name:</strong>
            <p>{selectedVersion.version_name}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>User:</strong>
            <p>{selectedVersion.user}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Module Name:</strong>
            <p>{selectedVersion.module_name}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50">
            <strong>Model Name:</strong>
            <p>{selectedVersion.model_name}</p>
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
            <strong>F1 Score:</strong>
            <p>{selectedVersion.f1_score}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50 ">
            <strong>Created At:</strong>
            <p>{new Date(selectedVersion.created_at).toLocaleString()}</p>
          </div>
          <div className="p-3 border rounded shadow-sm bg-gray-50 col-span-3">
            <strong>Completed:</strong>
            <p>{selectedVersion.is_completed ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>
      <div className="w-full space-x-3">
        {selectedVersion.version_speakers.length > 0 && (
          <div className="bg-white p-6 shadow rounded m-3">
            <h3 className="text-2xl font-bold mb-4">Trained Data</h3>
            <TrainedData
              // @ts-expect-error: data has a type mismatch, but it's handled correctly.
              data={selectedVersion}
              // trainedData={transformedData.trainedData}
              status={"trained"}
              hideHeader={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
