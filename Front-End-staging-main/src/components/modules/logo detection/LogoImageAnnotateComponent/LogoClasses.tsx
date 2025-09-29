import { Rectangle } from "./LogoCanvasControls";
type LogoClassesProps = {
  rectangles: Array<Rectangle>;
  drawRectangles: (rectangles: Array<Rectangle>) => void;
  onSave?: () => void;
};
const customColors: Array<string> = [
  "#eaf400",
  "#97fdd7",
  "#ff0302",
  "#fcd7e8",
  "#00ff02",
  "#9b76e6",
  "#cd0021",
  "#c4ead1",
];

const classColorMap: Record<string, string> = {};

const getClassColor = (className: string): string => {
  if (!classColorMap[className]) {
    const index = Object.keys(classColorMap).length % customColors.length;
    classColorMap[className] = customColors[index];
  }
  return classColorMap[className];
};

export const LogoClasses = ({
  rectangles,
  drawRectangles,
  onSave,
}: LogoClassesProps) => {
  const uniqueClassNames = Array.from(
    new Set(rectangles.map((r) => r.className).filter(Boolean))
  );

  return (
    <div className="w-1/5 bg-white min-h-40 m-3 p-4 shadow-md flex flex-col justify-between rounded-xl">
      <div>
        <h1 className="text-indigo-500 font-bold text-xl">Classes</h1>
        <div className="mt-2 space-y-1 max-h-[300px] overflow-y-auto">
          {uniqueClassNames.map((name, index) => {
            if (!name) return null;
            const count = rectangles.filter((r) => r.className === name).length;
            const color = getClassColor(name);

            return (
              <div
                key={index}
                className="p-2 text-black text-sm hover:bg-indigo-50 cursor-pointer font-semibold"
                onClick={() => {
                  drawRectangles(
                    rectangles.map((r) => ({
                      ...r,
                      className: r.className === name ? name : undefined,
                    }))
                  );
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                    <span>{name}</span>
                  </div>
                  <span className="text-gray-500 text-sm ml-2">({count})</span>
                </div>
                {/* <button
                  className="ml-4 text-white bg-red-600 py-1 px-1 rounded hover:bg-red-500 "
                  onClick={(e) => {
                    e.stopPropagation();
                    const filtered = rectangles.filter(
                      (r) => r.className !== name
                    );
                    setRectangles(filtered);
                    saveToHistory(filtered);
                  }}
                >
                  Delete
                </button> */}
              </div>
            );
          })}
        </div>
      </div>
      <button
        className="bg-indigo-600 text-white py-2 px-2 rounded"
        onClick={onSave}
      >
        Save
      </button>
    </div>
  );
};
