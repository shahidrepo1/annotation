import { SttTranscription } from "../../../api/useSttFileUpload.types";
import UrduKeyboard from "../../ui/UrduKeyboard";
import { useRef, useState } from "react";
import useSttSelectionStore from "../../../hooks/useSttSelectionStore";
import { SttModalEditingChunk } from "./sttModalComponent/SttModalEditingChunk";
import { SttModalButtons } from "./sttModalComponent/SttModalButtons";
import { backendServiceUrl } from "../../../api/apiConstants";
import { useSearchParams } from "react-router";

type SttModalProps = {
  data: SttTranscription;
  setIsModalOpen: (open: boolean) => void;
  addFolder: (folderName: string) => void;
  setData: (data: SttTranscription) => void;
  status: boolean;
  setUploadModalOpen: (val: boolean) => void;
};

export const SttModal = ({
  data,
  setIsModalOpen,
  addFolder,
  setData,
  status,
  setUploadModalOpen,
}: SttModalProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<Record<number, string>>({});
  const [updateData, setUpdateData] = useState<SttTranscription>(data);
  const [showConfirm, setShowConfirm] = useState(false);
  const [folderName, setFolderName] = useState<string>("");
  const { setselectedAudioIds, selectedAudioIds } = useSttSelectionStore();
  const [searchParams] = useSearchParams();
  const transcriptionQuery = searchParams.get("transcription") || "";
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const filteredChunks = updateData.chunks?.filter(
    (chunk) => !chunk.is_deleted
  );

  const handleAudioSelect = (id: number) => {
    setselectedAudioIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((audioId) => audioId !== id)
        : [...prevSelected, id]
    );
  };

  const handleTextChange = (id: number, newText: string) => {
    setEditedText((prev) => ({ ...prev, [id]: newText }));
  };
  const highlightMatch = (
    text: string,
    query: string
  ): React.JSX.Element | string => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="bg-yellow-300 font-bold rounded px-1">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 space-y-4 bg-white w-[900px] min-h-[450px] h-fit px-6 rounded-xl mx-auto shadow-lg border border-indigo-600 overflow-auto">
        <div
          className={`max-h-[400px] space-y-4 ${
            filteredChunks?.length > 1 ? "overflow-y-auto" : ""
          }`}
        >
          {filteredChunks?.length > 0 ? (
            filteredChunks?.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[40px_1fr_1fr] gap-x-3 border border-black p-4 items-center"
              >
                <div className="flex justify-center items-center h-full">
                  <input
                    type="checkbox"
                    checked={selectedAudioIds.includes(item.id)}
                    onChange={() => {
                      handleAudioSelect(item.id);
                    }}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <audio controls className="w-full mt-2">
                    <source
                      src={`${backendServiceUrl}media/stt_chunks/${item.chunk_name}`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <div className="space-y-2 w-full">
                  <h2 className="text-base font-semibold text-gray-900">
                    Converted Text
                  </h2>

                  <div className="flex justify-between items-start gap-2">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        ref={(el) => (inputRefs.current[item.id] = el)}
                        value={editedText[item.id] || ""}
                        onChange={(e) => {
                          handleTextChange(item.id, e.target.value);
                        }}
                        className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    ) : (
                      <p
                        className="font-aslam text-base text-gray-900 text-justify leading-relaxed text-md font-bold"
                        dir="rtl"
                      >
                        {highlightMatch(item.transcription, transcriptionQuery)}
                      </p>
                    )}

                    <SttModalEditingChunk
                      item={item}
                      editingId={editingId}
                      editedText={editedText}
                      setUpdateData={setUpdateData}
                      setEditingId={setEditingId}
                      setData={setData}
                      setEditedText={setEditedText}
                      data={data}
                      setFolderName={setFolderName}
                      status={status}
                    />
                  </div>
                  {editingId === item.id && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm w-fit">
                      <UrduKeyboard
                        onSelect={(char) => {
                          const inputEl = inputRefs.current[item.id];
                          if (!inputEl) return;

                          const currentValue = editedText[item.id] || "";
                          const cursorPos =
                            inputEl.selectionStart ?? currentValue.length;

                          if (char === "backspace") {
                            const newText =
                              currentValue.slice(0, cursorPos - 1) +
                              currentValue.slice(cursorPos);
                            handleTextChange(item.id, newText);

                            // move cursor back
                            setTimeout(() => {
                              inputEl.selectionStart = inputEl.selectionEnd =
                                cursorPos - 1;
                            }, 0);
                          } else {
                            const newText =
                              currentValue.slice(0, cursorPos) +
                              char +
                              currentValue.slice(cursorPos);
                            handleTextChange(item.id, newText);

                            // move cursor forward
                            setTimeout(() => {
                              inputEl.selectionStart = inputEl.selectionEnd =
                                cursorPos + char.length;
                            }, 0);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-red-600">No data available</p>
          )}
        </div>

        <SttModalButtons
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          setIsModalOpen={setIsModalOpen}
          folderName={folderName}
          setData={setData}
          addFolder={addFolder}
          setFolderName={setFolderName}
          filteredChunks={filteredChunks}
          setUploadModalOpen={setUploadModalOpen}
        />
      </div>
    </div>
  );
};
