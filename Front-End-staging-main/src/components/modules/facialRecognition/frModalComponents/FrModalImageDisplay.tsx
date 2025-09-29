import { FrType } from "../../../../api/useFrChunks.types";
import { backendServiceUrl } from "../../../../api/apiConstants";

type Props = {
  frData: FrType;
  selectedNames: { [key: string]: string };
  selectedImages: { [key: string]: boolean };
  onToggleImage: (imageUrl: string) => void;
};

export const FrModalImageDisplay = ({
  frData,
  selectedNames,
  selectedImages,
  onToggleImage,
}: Props) => {
  return (
    <>
      {frData.faces.map((face, index) => {
        const imageUrl = face.processed_image;
        const isChecked = selectedImages[imageUrl] || false;

        return (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:bg-indigo-50 transition duration-150 h-64"
          >
            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  onToggleImage(imageUrl);
                }}
                className="h-4 w-4 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex-1 h-full max-w-[60%]">
              <div className="w-full h-full rounded-md  overflow-hidden flex items-center justify-center">
                <img
                  src={`${backendServiceUrl.replace(/\/$/, "")}${imageUrl}`}
                  alt="Processed"
                  className="object-contain h-full w-full"
                />
              </div>
            </div>

            <div className="w-1/4 h-full flex items-center justify-center border-l border-gray-200 px-4">
              {selectedNames[imageUrl] ? (
                <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md">
                  {selectedNames[imageUrl]}
                </span>
              ) : (
                <span className="text-sm text-gray-500 italic">Unknown</span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
