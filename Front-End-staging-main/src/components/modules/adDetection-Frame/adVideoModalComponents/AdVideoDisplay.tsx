import { backendServiceUrl } from "../../../../api/apiConstants";
import { AdLabelType } from "../../../../api/useGetAdLabels.types";

type AdVideoDisplayProps = {
  selectedImages: Record<number, boolean>;
  adData: AdLabelType;
  imageLabels: { [key: string]: string };

  handleCheckboxChange: (imageId: number, isChecked: boolean) => void;
};
const AdVideoDisplay = ({
  selectedImages,
  adData,
  imageLabels,

  handleCheckboxChange,
}: AdVideoDisplayProps) => {
  return (
    <>
      <div className="mt-4 overflow-y-auto max-h-64 space-y-4 pr-1">
        {adData.chunk.map((image, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:bg-indigo-50 transition duration-150"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-3 w-3 cursor-pointer accent-indigo-600"
                checked={!!selectedImages[image.id]}
                onChange={(e) => {
                  handleCheckboxChange(image.id, e.target.checked);
                }}
                id={`checkbox-${String(image.id)}`}
              />
            </div>

            <div className="flex-1 max-w-[400px]">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video
                  src={`${backendServiceUrl.replace(/\/$/, "")}${
                    image.media_file_url
                  }`}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="w-1/3 text-center">
              <span className="inline-block text-sm font-medium bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md">
                {imageLabels[image.id] || image.label || "No label"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AdVideoDisplay;
