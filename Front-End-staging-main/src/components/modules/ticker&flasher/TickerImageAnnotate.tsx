import { useState, useRef, useEffect, useCallback } from "react";
import { LogoToolbar } from "../logo detection/LogoImageAnnotateComponent/LogoToolbar";
import { LogoClasses } from "../logo detection/LogoImageAnnotateComponent/LogoClasses";
import { LogoCanvasControls } from "../logo detection/LogoImageAnnotateComponent/LogoCanvasControls";
import { Rectangle } from "../logo detection/LogoImageAnnotateComponent/LogoCanvasControls";
import { TickerEditorModal } from "./TickerEditorModal";

type LogoImageAnnotateProps = {
  imageSrc: string;
  initialRectangles?: Array<Rectangle>;
  onSaveAnnotation?: (annotatedImage: {
    imageSrc: string;
    rectangles: Array<Rectangle>;
  }) => void;
  onClose?: () => void;
  isVideo?: boolean;
  isTrained?: boolean;
};

const customColors: Array<string> = [
  "#9b76e6",
  "#eaf400",
  "#97fdd7",
  "#ff0302",
  "#fcd7e8",
  "#00ff02",
  "#cd0021",
  "#c4ead1",
];

export const TickerImageAnnotate = ({
  imageSrc,
  initialRectangles = [],
  onSaveAnnotation,
  onClose,
  isTrained,
}: LogoImageAnnotateProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rectangles, setRectangles] =
    useState<Array<Rectangle>>(initialRectangles);
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState<"hand" | "crop" | null>(null);
  const [editingRect, setEditingRect] = useState<Rectangle | null>(null);
  const [history, setHistory] = useState<Array<Array<Rectangle>>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const classColorMap = useRef<Record<string, string>>({}).current;

  const getClassColor = useCallback(
    (className: string): string => {
      if (!classColorMap[className]) {
        const index = Object.keys(classColorMap).length % customColors.length;
        classColorMap[className] = customColors[index];
      }
      return classColorMap[className];
    },
    [classColorMap]
  );

  const saveToHistory = useCallback(
    (currentRects: Array<Rectangle>) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...currentRects]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex, setHistory, setHistoryIndex]
  );

  const handleSave = () => {
    if (onSaveAnnotation) {
      onSaveAnnotation({
        imageSrc,
        rectangles,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const drawRectangles = useCallback(
    (rects: Array<Rectangle>, hoveredId: string | null = null) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imageRect = img.getBoundingClientRect();
      const naturalAspect = img.naturalWidth / img.naturalHeight;
      const displayedAspect = imageRect.width / imageRect.height;

      let displayedWidth, displayedHeight;

      if (naturalAspect > displayedAspect) {
        displayedWidth = imageRect.width;
        displayedHeight = imageRect.width / naturalAspect;
      } else {
        displayedHeight = imageRect.height;
        displayedWidth = imageRect.height * naturalAspect;
      }
      const scaleX = displayedWidth / img.naturalWidth;
      const scaleY = displayedHeight / img.naturalHeight;

      rects.forEach((rect) => {
        const x = rect.x * scaleX;
        const y = rect.y * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;

        // Draw rectangle
        ctx.strokeStyle = rect.className
          ? getClassColor(rect.className)
          : "cyan";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();

        if (rect.id === hoveredId && rect.className) {
          ctx.font = "bold 14px Arial";
          const textWidth = ctx.measureText(rect.className).width;
          const padding = 8;
          const textHeight = 20;
          const borderRadius = 4;
          const labelX = x + width / 2 - textWidth / 2 - padding;
          const labelY = y - textHeight - 4;
          const labelWidth = textWidth + padding * 2;

          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.beginPath();
          ctx.roundRect(labelX, labelY, labelWidth, textHeight, borderRadius);
          ctx.fill();

          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(rect.className, x + width / 2, labelY + textHeight / 2);

          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.beginPath();
          ctx.moveTo(x + width / 2 - 5, y);
          ctx.lineTo(x + width / 2 + 5, y);
          ctx.lineTo(x + width / 2, y - 4);
          ctx.fill();
        }
      });
    },
    [getClassColor]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img && img.complete) {
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      drawRectangles(rectangles);
    }
  }, [rectangles, imageSrc, drawRectangles]);

  useEffect(() => {
    if (history.length === 0 && rectangles.length === 0) {
      saveToHistory([]);
    }
  }, [history.length, rectangles.length, saveToHistory]);

  return (
    <div className="bg-gray-100 p-6 rounded-md">
      <div className="flex w-full justify-center">
        <LogoClasses
          rectangles={rectangles}
          drawRectangles={drawRectangles}
          onSave={handleSave}
        />
        <LogoCanvasControls
          position={position}
          imageRef={imageRef}
          imageSrc={imageSrc}
          scale={scale}
          canvasRef={canvasRef}
          setPosition={setPosition}
          drawRectangles={drawRectangles}
          rectangles={rectangles}
          setRectangles={setRectangles}
          saveToHistory={saveToHistory}
          setEditingRect={setEditingRect}
          setIsModalOpen={setIsModalOpen}
          activeTool={activeTool}
          containerRef={containerRef}
        />
        <div className="w-1/6 bg-white m-3 p-4 flex flex-col justify-center space-y-6 rounded-xl shadow-md">
          <LogoToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            setPosition={setPosition}
            historyIndex={historyIndex}
            scale={scale}
            setScale={setScale}
            drawRectangles={drawRectangles}
            setHistoryIndex={setHistoryIndex}
            setRectangles={setRectangles}
            history={history}
            // isDisabled={isDisabled}
            isTrained={isTrained}
          />
        </div>
        {isModalOpen && editingRect && (
          <TickerEditorModal
            initialLabel={editingRect?.className}
            onSave={(name) => {
              const updatedRectangles = rectangles.map((rect) =>
                rect.id === editingRect.id ? { ...rect, className: name } : rect
              );
              setRectangles(updatedRectangles);
              saveToHistory(updatedRectangles);
              setIsModalOpen(false);
              setEditingRect(null);
            }}
            onClose={() => {
              setIsModalOpen(false);
              setEditingRect(null);
            }}
            onDelete={() => {
              const updatedRectangles = rectangles.filter(
                (rect) => rect.id !== editingRect.id
              );
              setRectangles(updatedRectangles);
              saveToHistory(updatedRectangles);
              setIsModalOpen(false);
              setEditingRect(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
