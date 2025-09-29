import { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Modal({ children }: { children: ReactNode }) {
  const domNode = document.getElementById("portal");

  if (!domNode) {
    console.error(
      "Portal DOM node not found. Ensure the element with id 'portal' exists."
    );
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 transition-all flex items-center justify-center bg-black/70">
      {children}
    </div>,
    domNode
  );
}
