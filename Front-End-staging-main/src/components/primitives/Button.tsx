import { twMerge } from "tailwind-merge";
import Spinner from "../uiComponents/Spinner";

type Props = Omit<React.ComponentProps<"button">, "className"> & {
  children: React.ReactNode;
  isLoading?: boolean;
};

function Button(props: Props) {
  const { children, isLoading, ...restProps } = props;

  return (
    <button
      {...restProps}
      className={twMerge(
        "w-full py-2 rounded-md",
        "border-2 border-indigo-500",
        "text-indigo-500 hover:text-white font-medium",
        "hover:bg-indigo-500 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "relative"
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-indigo-400/70">
          <div className="w-8">
            <Spinner />
          </div>
        </div>
      )}
      {children}
    </button>
  );
}

export default Button;
