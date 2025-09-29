type ConfirmDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <p className="mb-4 text-lg">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={onConfirm}
          >
            Yes, Close
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
