import {
  LiaHandPaper,
  LiaRedoAltSolid,
  LiaUndoAltSolid,
} from "react-icons/lia";
import { BsBoundingBox } from "react-icons/bs";
import { Rectangle } from "./LogoCanvasControls";

type LogoToolbarProps = {
  activeTool: string | null;
  setActiveTool: (tool: "hand" | "crop" | null) => void;
  setPosition: (position: { x: number; y: number }) => void;
  historyIndex: number;
  scale: number;
  setScale: (scale: number) => void;
  drawRectangles: (rectangles: Array<Rectangle>) => void;
  history: Array<Array<Rectangle>>;
  setHistoryIndex: (index: number) => void;
  setRectangles: (rectangles: Array<Rectangle>) => void;
  isTrained?: boolean;
  // isDisabled?: boolean;
};

export const LogoToolbar = ({
  activeTool,
  setActiveTool,
  setPosition,
  historyIndex,
  scale,
  setScale,
  drawRectangles,
  history,
  setHistoryIndex,
  setRectangles,
  isTrained,
}: // isDisabled = false,
LogoToolbarProps) => {
  // console.log("isTrained?", isTrained);

  const handleZoom = (direction: "in" | "out" | "reset") => {
    let newScale = scale;
    if (direction === "in") newScale = scale * 1.2;
    else if (direction === "out") newScale = scale / 1.2;
    else newScale = 1;

    newScale = Math.min(Math.max(newScale, 0.5), 3);
    setScale(newScale);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setRectangles([...history[newIndex]]);
      drawRectangles(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setRectangles([...history[newIndex]]);
      drawRectangles(history[newIndex]);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center relative">
        <LiaHandPaper
          className={`cursor-pointer hover:text-indigo-700 ${
            isTrained ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
          } ${
            activeTool === "hand"
              ? "text-white bg-indigo-400 rounded-md p-1.5 min-w-[32px] min-h-[32px]"
              : "text-indigo-500 w-6 h-6"
          }`}
          onClick={() => {
            if (isTrained) return;
            setActiveTool(activeTool === "hand" ? null : "hand");
          }}
        />

        {activeTool === "hand" && (
          <div className="flex flex-col space-y-1 absolute left-8">
            <button
              onClick={() => {
                handleZoom("in");
              }}
              className="text-xs px-2 bg-indigo-100 rounded"
            >
              +
            </button>
            <button
              onClick={() => {
                handleZoom("out");
              }}
              className="text-xs px-2 bg-indigo-100 rounded"
            >
              -
            </button>
            <button
              onClick={() => {
                handleZoom("reset");
                setPosition({ x: 0, y: 0 });
              }}
              className="text-xs px-2 bg-indigo-100 rounded"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <BsBoundingBox
        className={`w-6 h-6 mx-auto cursor-pointer hover:text-indigo-700 ${
          isTrained ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        } ${
          activeTool === "crop"
            ? "text-white bg-indigo-400 rounded-md p-1.5 min-w-[32px] min-h-[32px]"
            : "text-indigo-500 w-4 h-4"
        }`}
        onClick={() => {
          if (isTrained) return;
          setActiveTool(activeTool === "crop" ? null : "crop");
        }}
      />

      <LiaUndoAltSolid
        className={`w-5 h-5 mx-auto cursor-pointer ${
          isTrained
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : historyIndex > 0
            ? "text-white bg-indigo-400 rounded-md p-1.5 min-w-[32px] min-h-[32px]"
            : "text-indigo-500 w-6 h-6"
        }`}
        onClick={() => {
          if (isTrained) return;
          handleUndo();
        }}
      />
      <LiaRedoAltSolid
        className={`w-5 h-5 mx-auto cursor-pointer ${
          isTrained
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : historyIndex < history.length - 1
            ? "text-white bg-indigo-400 rounded-md p-1.5 min-w-[32px] min-h-[32px]"
            : "text-indigo-500 w-6 h-6"
        }`}
        onClick={() => {
          if (isTrained) return;
          handleRedo();
        }}
      />
    </>
  );
};
