import { TrainedItem } from "../../../api/useSentimentTrainedData.types";
import { backendServiceUrl } from "../../../api/apiConstants";
import { FiDownload } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { SiGoogledocs } from "react-icons/si";
import { IoDocumentText } from "react-icons/io5";

type Props = {
  items: Array<TrainedItem>;
  sentiment: "positive" | "neutral" | "negative";
  closeModal: () => void;
};

export const SentimentTrainingModal = ({
  items,
  // sentiment,
  closeModal,
}: Props) => {
  const getSentimentColor = (sent: string) => {
    switch (sent) {
      case "positive":
        return "bg-green-300";
      case "negative":
        return "bg-red-300";
      case "neutral":
        return "bg-yellow-300 text-black";
      default:
        return "bg-gray-400";
    }
  };

  const renderItem = (item: TrainedItem) => {
    const fileUrl = item.media_file;
    const fileExtension = fileUrl?.split(".").pop()?.toLowerCase() || "";

    const getMediaType = (ext: string) => {
      if (["mp4", "webm", "ogg"].includes(ext)) return "videos";
      if (["mp3", "wav", "mpeg"].includes(ext)) return "audio";
      if (["pdf", "doc", "docx"].includes(ext)) return "texts";
      return "texts";
    };

    const mediaType = getMediaType(fileExtension);
    const mediaPath = `${backendServiceUrl}media/sentiment_media/${mediaType}/${fileUrl}`;

    const getFileIcon = () => {
      if (fileExtension === "pdf")
        return <FaFilePdf className="text-red-600" size={20} />;
      if (fileExtension === "docx")
        return <SiGoogledocs className="text-blue-500" size={20} />;
      if (fileExtension === "doc")
        return <IoDocumentText className="text-gray-600" size={20} />;
      return null;
    };

    if (mediaType === "videos") {
      return (
        <div
          key={item.analysis_id}
          className="flex items-center justify-between border-b py-3"
        >
          <video controls className="w-full max-w-md rounded border shadow-sm">
            <source src={mediaPath} type={`video/${fileExtension}`} />
          </video>
          <span
            className={`px-3 py-1 rounded text-sm font-medium capitalize ${getSentimentColor(
              item.sentiment
            )}`}
          >
            {item.sentiment}
          </span>
        </div>
      );
    }

    if (mediaType === "audio") {
      return (
        <div
          key={item.analysis_id}
          className="flex items-center justify-between border-b py-3"
        >
          <audio controls className="w-full max-w-md rounded border shadow-sm">
            <source src={mediaPath} type={`audio/${fileExtension}`} />
          </audio>
          <span
            className={`px-3 py-1.5 rounded text-sm font-medium capitalize ${getSentimentColor(
              item.sentiment
            )}`}
          >
            {item.sentiment}
          </span>
        </div>
      );
    }

    return (
      <div
        key={item.analysis_id}
        className="flex items-center justify-between border-b py-3"
      >
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          {getFileIcon()}
          <span className="truncate max-w-[250px]">{fileUrl}</span>
          <a
            href={mediaPath}
            download
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
          >
            <FiDownload />
          </a>
        </div>

        <span
          className={`px-3 py-1 rounded text-sm font-medium capitalize ${getSentimentColor(
            item.sentiment
          )}`}
        >
          {item.sentiment}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative p-6 space-y-6 bg-white w-[800px] max-h-[90vh] overflow-auto rounded-xl shadow-lg border border-indigo-600">
        <div className="flex justify-center">
          <h2 className="text-xl font-semibold text-indigo-600">
            Sentiment Training Data
          </h2>
        </div>

        <div className="space-y-4">{items.map(renderItem)}</div>

        <div className="flex justify-center gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg bg-white hover:bg-indigo-600 hover:text-white flex items-center gap-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
