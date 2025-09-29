import type React from "react";
import { useState } from "react";

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
  id?: string;
  className?: string;
  delete?: boolean;
};

type LogoCanvasControlsProps = {
  position: { x: number; y: number };
  imageRef: React.RefObject<HTMLImageElement>;
  imageSrc: string;
  scale: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setPosition: (position: { x: number; y: number }) => void;
  drawRectangles: (
    rectangles: Array<Rectangle>,
    hoveredId?: string | null
  ) => void;
  rectangles: Array<Rectangle>;
  setRectangles: (rectangles: Array<Rectangle>) => void;
  saveToHistory: (currentRects: Array<Rectangle>) => void;
  setEditingRect: (rect: Rectangle | null) => void;
  setIsModalOpen: (open: boolean) => void;
  activeTool: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const LogoCanvasControls = ({
  position,
  imageRef,
  imageSrc,
  scale,
  canvasRef,
  setPosition,
  drawRectangles,
  rectangles,
  setRectangles,
  saveToHistory,
  setEditingRect,
  setIsModalOpen,
  activeTool,
  containerRef,
}: LogoCanvasControlsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredRect, setHoveredRect] = useState<Rectangle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const CLICK_THRESHOLD = 5;

  // function to get consistent coordinates
  const getImageCoordinates = (e: React.MouseEvent) => {
    if (!imageRef.current) return { x: 0, y: 0 };

    const imageRect = imageRef.current.getBoundingClientRect();
    const img = imageRef.current;

    const naturalAspect = img.naturalWidth / img.naturalHeight;
    const displayedAspect = imageRect.width / imageRect.height;

    let displayedWidth, displayedHeight;
    let offsetX = 0,
      offsetY = 0;

    if (naturalAspect > displayedAspect) {
      displayedWidth = imageRect.width;
      displayedHeight = imageRect.width / naturalAspect;
      offsetY = (imageRect.height - displayedHeight) / 2;
    } else {
      displayedHeight = imageRect.height;
      displayedWidth = imageRect.height * naturalAspect;
      offsetX = (imageRect.width - displayedWidth) / 2;
    }

    const scaleX = img.naturalWidth / displayedWidth;
    const scaleY = img.naturalHeight / displayedHeight;

    const mouseX = e.clientX - imageRect.left - offsetX;
    const mouseY = e.clientY - imageRect.top - offsetY;

    const x = mouseX * scaleX;
    const y = mouseY * scaleY;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;

    if (activeTool === "hand") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      return;
    }

    if (activeTool === "crop") {
      const coords = getImageCoordinates(e);
      setIsDrawing(true);
      setStartPoint(coords);
      setCurrentRect({
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        id: Date.now().toString(),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;

    if (isDragging && activeTool === "hand") {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
      return;
    }

    if (isDrawing && currentRect && activeTool === "crop") {
      const coords = getImageCoordinates(e);
      const newRect = {
        ...currentRect,
        width: coords.x - startPoint.x,
        height: coords.y - startPoint.y,
      };
      setCurrentRect(newRect);
      drawRectangles([...rectangles, newRect]);
      return;
    }
    if (!isDrawing && activeTool !== "crop") {
      const coords = getImageCoordinates(e);
      const hovered = rectangles.find(
        (r) =>
          coords.x >= r.x &&
          coords.x <= r.x + r.width &&
          coords.y >= r.y &&
          coords.y <= r.y + r.height
      );

      if (hovered?.id !== hoveredRect?.id) {
        setHoveredRect(hovered || null);
        drawRectangles(rectangles, hovered?.id || null);
      }
    }
  };

  const handleMouseLeave = () => {
    if (hoveredRect) {
      setHoveredRect(null);
      drawRectangles(rectangles);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const endX = e.clientX;
    const endY = e.clientY;

    if (isDragging) {
      setIsDragging(false);
      const movedX = Math.abs(endX - (dragStart.x + position.x));
      const movedY = Math.abs(endY - (dragStart.y + position.y));
      const isClick = movedX < CLICK_THRESHOLD && movedY < CLICK_THRESHOLD;
      if (!isClick) return;
    }

    if (isDrawing && currentRect && activeTool === "crop") {
      if (Math.abs(currentRect.width) > 5 && Math.abs(currentRect.height) > 5) {
        const newRectangles = [...rectangles, currentRect];
        setRectangles(newRectangles);
        saveToHistory(newRectangles);
        setEditingRect(currentRect);
        setIsModalOpen(true);
      }
      setIsDrawing(false);
      setCurrentRect(null);
      return;
    }

    if (activeTool === "hand" && imageRef.current) {
      const coords = getImageCoordinates(e);
      const clickedRect = rectangles.find(
        (r) =>
          coords.x >= r.x &&
          coords.x <= r.x + r.width &&
          coords.y >= r.y &&
          coords.y <= r.y + r.height
      );

      if (clickedRect) {
        setEditingRect(clickedRect);
        setIsModalOpen(true);
      }
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="w-7/10 mb-4 m-3 flex justify-center items-center relative overflow-hidden"
      >
        <div
          className="relative"
          style={{
            transform: `translate(${position.x.toString()}px, ${position.y.toString()}px)`,
          }}
        >
          <img
            onLoad={() => {
              if (canvasRef.current && imageRef.current) {
                canvasRef.current.width = imageRef.current.clientWidth;
                canvasRef.current.height = imageRef.current.clientHeight;
                drawRectangles(rectangles);
              }
            }}
            ref={imageRef}
            src={imageSrc || "/placeholder.svg"}
            alt="Selected for annotation"
            className="max-w-full max-h-[70vh] object-contain"
            style={{
              transform: `scale(${scale.toString()})`,
              transformOrigin: "top left",
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${scale.toString()})`,
              transformOrigin: "top left",
            }}
          />
        </div>
        <div
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor:
              activeTool === "hand"
                ? "grab"
                : activeTool === "crop"
                ? "crosshair"
                : "default",
          }}
        />
      </div>
    </>
  );
};
