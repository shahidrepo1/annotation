import { ButtonHTMLAttributes, ReactNode } from "react";

type Button = {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export default function Button({ children, className, ...props }: Button) {
  return (
    <button
      className={`px-4 py-2 border-2 border-indigo-500 text-indigo-500 
            hover:bg-indigo-500 hover:text-white transition-colors 
             rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
               className ?? ""
             }`}
      {...props}
    >
      {children}
    </button>
  );
}
