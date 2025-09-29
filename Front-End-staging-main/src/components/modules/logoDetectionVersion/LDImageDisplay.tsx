import { IoClose } from "react-icons/io5";
import { LogoTrainedImage } from "../../../api/useLogoTrainedData.types";

type Props = {
  images: Array<LogoTrainedImage>;
  folderDate: string;
  closeModal: () => void;
};

export const LDImageDisplay = ({ images, folderDate, closeModal }: Props) => {
  const hasData = images.length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative p-8 bg-white w-[900px] max-h-[80vh] rounded-xl mx-auto shadow-lg border border-indigo-600 flex flex-col overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          aria-label="Close Modal"
        >
          <IoClose />
        </button>

        {hasData && (
          <h2 className="text-lg font-semibold text-indigo-600 mb-4 sticky top-0 bg-white pb-4">
            Folder: {folderDate}
          </h2>
        )}

        <div className="flex-grow">
          {hasData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pr-2">
              {images.map((image) => (
                <div
                  key={image.image_id}
                  className="relative border rounded-md overflow-hidden"
                >
                  <img
                    src={image.image_url}
                    alt={image.image_name}
                    className="w-full h-auto object-contain"
                  />

                  {image.labels.map((rect) => (
                    <div
                      key={rect.label_id}
                      className="absolute border-2 border-red-500"
                      style={{
                        top: `${String(rect.y)}px`,
                        left: `${String(rect.x)}px`,
                        width: `${String(rect.width)}px`,
                        height: `${String(rect.height)}px`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg font-medium h-full flex items-center justify-center">
              No data found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
