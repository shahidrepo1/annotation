import { NavLink } from "react-router";
import UserDropdown from "../modules/user/UserDropdown";
import { useState, useRef, MutableRefObject } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useClickAway } from "@uidotdev/usehooks";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const links = [
  { link: "sr-training", name: "SR" },
  { link: "stt", name: "STT" },
  { link: "fr", name: "FR" },
];

const adDetectionLinks = [
  { link: "ad-detection-frame", name: "Frame" },
  { link: "ad-detection-audio", name: "Audio" },
  { link: "ad-detection-audio&frame", name: "Frame & Audio" },
];

const otherLinks = [
  { link: "ticker-and-flasher", name: "Ticker and Flasher" },
  { link: "object-detection", name: "Object Detection" },
  { link: "logo-detection", name: "Logo Detection" },
];

const ocrLinks = [
  { link: "ocr-media-english", name: "English Media" },
  { link: "ocr-media-urdu", name: "Urdu Media" },
  { link: "ocr-document", name: "English Document" },
  { link: "ocr-doc-urdu", name: "Urdu Document" },
  { link: "ocr-anpr", name: "ANPR" },
];

const moreLinks = [
  { link: "sentiment-analysis", name: "Sentiment Analysis" },
  { link: "speech-to-text", name: "Emotion Detection" },
  { link: "speech-to-text", name: "Text Detection" },
];

export default function Header() {
  const [showAdDetection, setShowAdDetection] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });

  const adDetectionRef = useClickAway(() => {
    setShowAdDetection(false);
  });
  const ocrRef = useClickAway(() => {
    setShowOcr(false);
  });

  const navRef = useRef<HTMLUListElement>(null);
  const adDetectionTriggerRef = useRef<HTMLLIElement>(null);
  const ocrTriggerRef = useRef<HTMLLIElement>(null);

  const scrollNav = (direction: "left" | "right") => {
    if (navRef.current) {
      navRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth",
      });
    }
  };

  const updateDropdownPosition = (triggerRef: React.RefObject<HTMLElement>) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        left: rect.left,
        top: rect.bottom + window.scrollY,
      });
    }
  };

  const handleAdDetectionClick = () => {
    updateDropdownPosition(adDetectionTriggerRef);
    setShowAdDetection(!showAdDetection);
    setShowOcr(false);
  };

  const handleOcrClick = () => {
    updateDropdownPosition(ocrTriggerRef);
    setShowOcr(!showOcr);
    setShowAdDetection(false);
  };

  return (
    <header className="flex justify-between items-center px-6 h-16 bg-indigo-50 relative">
      <h1 className="font-bold text-2xl text-indigo-500">Annotator</h1>

      <div className="relative flex items-center gap-2 max-w-[70%] w-full">
        <button
          onClick={() => {
            scrollNav("left");
          }}
          className="p-1 bg-white rounded shadow hover:bg-indigo-100"
        >
          <FaChevronLeft className="text-indigo-500" />
        </button>

        <div className="flex-1 overflow-hidden">
          <ul
            ref={navRef}
            className="flex gap-6 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
          >
            {links.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.link}
                  className={({ isActive }) =>
                    isActive ? "text-indigo-500" : "hover:text-indigo-500"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}

            {otherLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.link}
                  className={({ isActive }) =>
                    isActive ? "text-indigo-500" : "hover:text-indigo-500"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}

            <li ref={adDetectionTriggerRef}>
              <button
                onClick={handleAdDetectionClick}
                className="flex items-center text-gray-900 hover:text-indigo-500"
              >
                Ad Detection <IoMdArrowDropdown className="ml-1" />
              </button>
            </li>

            <li ref={ocrTriggerRef}>
              <button
                onClick={handleOcrClick}
                className="flex items-center text-gray-900 hover:text-indigo-500"
              >
                OCR <IoMdArrowDropdown className="ml-1" />
              </button>
            </li>

            {moreLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.link}
                  className={({ isActive }) =>
                    isActive ? "text-indigo-500" : "hover:text-indigo-500"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => {
            scrollNav("right");
          }}
          className="p-1 bg-white rounded shadow hover:bg-indigo-100"
        >
          <FaChevronRight className="text-indigo-500" />
        </button>
      </div>

      {showAdDetection && (
        <ul
          ref={adDetectionRef as MutableRefObject<HTMLUListElement>}
          className="fixed bg-white shadow-md p-2 space-y-1 z-50 border min-w-[200px]"
          style={{
            left: `${dropdownPosition.left.toString()}px`,
            top: `${dropdownPosition.top.toString()}px`,
          }}
        >
          {adDetectionLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.link}
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-500 font-medium"
                    : "hover:text-indigo-500"
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}

      {showOcr && (
        <ul
          ref={ocrRef as MutableRefObject<HTMLUListElement>}
          className="fixed bg-white shadow-md p-2 space-y-1 z-50 border min-w-[200px]"
          style={{
            left: `${dropdownPosition.left.toString()}px`,
            top: `${dropdownPosition.top.toString()}px`,
          }}
        >
          {ocrLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.link}
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-500 font-medium"
                    : "hover:text-indigo-500"
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}

      <UserDropdown />
    </header>
  );
}
