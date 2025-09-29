type UrduKeyboardProps = {
  onSelect: (char: string) => void;
};

const urduKeys = [
  ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"],
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ھ", "خ", "ح"],
  ["ج", "چ", "ٹ", "ت", "د", "ڈ", "ذ", "ر", "ڑ", "ز"],
  ["س", "ش", "ی", "ب", "ن", "م", "ا", "ء", "Enter"],
  ["Space", "←"],
];

const UrduKeyboard = ({ onSelect }: UrduKeyboardProps) => {
  const handleKeyPress = (key: string) => {
    if (key === "←") {
      onSelect("backspace");
    } else if (key === "Space") {
      onSelect(" ");
    } else if (key === "Enter") {
      onSelect("\n");
    } else {
      onSelect(key);
    }
  };

  return (
    <div className="flex flex-col bg-gray-200 p-4 rounded-lg shadow-lg w-fit">
      {urduKeys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2 mb-2">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => {
                handleKeyPress(key);
              }}
              className={`px-3 py-2 text-md font-bold rounded-md shadow-md bg-white hover:bg-indigo-100 active:bg-indigo-300 ${
                key === "Space"
                  ? "flex-1 text-center"
                  : key === "Enter"
                  ? "w-24"
                  : "w-12"
              }`}
            >
              {key === "Space" ? "␣" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UrduKeyboard;
