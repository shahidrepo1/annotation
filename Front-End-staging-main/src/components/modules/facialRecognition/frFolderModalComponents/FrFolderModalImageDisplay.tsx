import { MdDelete } from "react-icons/md";
import { FrFolderType } from "../../../../api/useFrLabelChunks.types";
import { backendServiceUrl } from "../../../../api/apiConstants";
import { useFrCheckedImages } from "../../../../hooks/useFrCheckedImages";

type Props = {
  frData: FrFolderType;
  handleDelete: (imageKey: number) => void;
  isTrained?: boolean;
  selectedNames: { [key: string]: string };
};

export const FrFolderModalImageDisplay = ({
  frData,
  handleDelete,
  isTrained,
  selectedNames,
}: Omit<Props, "checkedImages" | "setCheckedImages">) => {
  const { checkedImages, toggleImage } = useFrCheckedImages();

  return (
    <>
      <div className="flex justify-center my-4 h-64">
        <div className="flex-1 border border-gray-200 overflow-y-scroll rounded-lg bg-gray-50 shadow-sm px-4 py-2 space-y-4">
          {frData?.images?.map((image, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:bg-indigo-50 transition duration-150"
            >
              <div className="w-1/12 flex justify-center">
                <input
                  type="checkbox"
                  checked={!!checkedImages[image.processedImage]}
                  onChange={() => {
                    toggleImage(image.processedImage);
                  }}
                  className="h-4 w-4 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="w-7/12">
                <img
                  src={`${backendServiceUrl.replace(/\/$/, "")}${
                    image.processedImage
                  }`}
                  alt="Processed content"
                  className="object-contain h-40 mx-auto rounded-md"
                />
              </div>

              <div className="w-3/12 flex justify-center">
                {isTrained && checkedImages[image.processedImage] ? (
                  <span className="text-sm font-medium bg-red-100 text-red-800 px-4 py-2 rounded-md">
                    ForUntrain
                  </span>
                ) : selectedNames[image.processedImage] ? (
                  <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md">
                    {selectedNames[image.processedImage]}
                  </span>
                ) : (
                  <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md">
                    {frData.label}
                  </span>
                )}
              </div>

              {!isTrained && (
                <div>
                  <MdDelete
                    className="text-xl text-red-500 hover:text-red-700 cursor-pointer transition duration-150"
                    onClick={() => {
                      handleDelete(image.id);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FrFolderModalImageDisplay;
