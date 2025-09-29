import { FiUpload } from "react-icons/fi";

type FileUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  errorMessage: string | null;
};

export default function OCRDocUrduFileUpload({
  file,
  onFileChange,
  errorMessage,
}: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    onFileChange(selectedFile || null);
  };

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center w-96 mx-auto p-6 border-2 border-dashed border-indigo-500 rounded-lg bg-gray-50 mt-4"
        role="button"
        tabIndex={0}
        aria-label="File upload area"
      >
        <label
          htmlFor="document-upload"
          className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-gray-800"
        >
          <FiUpload
            size={48}
            className="mb-3 text-indigo-600 hover:text-indigo-500"
          />
          <span className="text-center text-sm font-medium max-w-[220px] truncate">
            {file ? file.name : "Click to upload a document file"}
          </span>
          <input
            id="document-upload"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={handleFileChange}
            className="hidden"
            aria-required="true"
            disabled={!!file}
          />
        </label>
        {file && (
          <p className="mt-3 text-xs text-gray-500 text-center">
            Selected file:{" "}
            <span className="font-semibold inline-block max-w-[220px] truncate align-middle">
              {file.name}
            </span>
          </p>
        )}
      </div>
      {errorMessage && (
        <p className="text-red-500 text-center text-sm">{errorMessage}</p>
      )}
    </div>
  );
}
