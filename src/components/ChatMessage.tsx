import React, { useEffect, useRef, useState } from "react";

interface ChatMessageProps {
  avatarUrl: string;
  name: string;
  time: string;
  message: string;
  type: string;
  attachUrl: string;
  onDelete: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  avatarUrl,
  name,
  time,
  message,
  type,
  attachUrl,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDelete();
  };

  return (
    <div className="flex items-start gap-2.5 group">
      <img
        className="w-8 h-8 rounded-full"
        src={avatarUrl}
        alt={`${name} image`}
      />

      <div className="flex flex-col w-fit max-w-[80%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[60%] items-start">
        <span className="text-sm font-normal text-gray-50">{time}</span>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {type === "0" && (
            <div className="flex flex-col leading-1.5 p-3 border-gray-200 bg-gray-50 bg-opacity-30 rounded-e-xl rounded-es-xl">
              <p className="text-sm font-normal text-gray-50 break-all whitespace-pre-wrap">
                {message}
              </p>
            </div>
          )}
          {type === "1" && (
            <div className="group relative">
              <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <button
                  data-tooltip-target="download-image"
                  onClick={() => {
                    window.open(attachUrl, "_blank");
                  }}
                  className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none focus:ring-gray-50"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                    <path d="M17 0h-5.768a1 1 0 1 0 0 2h3.354L8.4 8.182A1.003 1.003 0 1 0 9.818 9.6L16 3.414v3.354a1 1 0 0 0 2 0V1a1 1 0 0 0-1-1Z" />
                    <path d="m14.258 7.985-3.025 3.025A3 3 0 1 1 6.99 6.768l3.026-3.026A3.01 3.01 0 0 1 8.411 2H2.167A2.169 2.169 0 0 0 0 4.167v11.666A2.169 2.169 0 0 0 2.167 18h11.666A2.169 2.169 0 0 0 16 15.833V9.589a3.011 3.011 0 0 1-1.742-1.604Z" />
                  </svg>
                </button>
              </div>
              <img
                src={attachUrl}
                className="rounded-lg max-w-full h-auto max-h-40"
              />
            </div>
          )}

          {/* Dropdown container */}
          <div
            className={`relative flex transition-opacity duration-200 ${
              isMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
            }`}
            ref={dropdownRef}
          >
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`inline-flex self-center items-center p-2 rounded-lg focus:outline-none transition ${
                isMenuOpen
                  ? "bg-gray-100 bg-opacity-50"
                  : "bg-transparent hover:bg-gray-100 hover:bg-opacity-50"
              }`}
              type="button"
            >
              <svg
                className="w-4 h-4 text-gray-50"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 4 15"
              >
                <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute z-10 mt-9 left-0 bg-gray-50 bg-opacity-90 divide-y divide-gray-100 rounded-lg shadow-sm md:w-40">
                <ul className="p-2 text-sm text-red-500">
                  {type === "1" && (
                    <li>
                      <button
                        onClick={() => {
                          window.open(attachUrl, "_blank");
                        }}
                        className="flex items-center gap-2 p-2 rounded hover:bg-red-300 hover:bg-opacity-50 hover:text-red-800 transition-colors duration-200 w-full text-left"
                      >
                        <svg
                          className="w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 16 18"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                          />
                        </svg>
                        <span className="hidden min-[420px]:inline">
                          Download
                        </span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 p-2 rounded hover:bg-red-300 hover:bg-opacity-50 hover:text-red-800 transition-colors duration-200 w-full text-left"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-1.5a1 1 0 01-1-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 01-1 1H7a1 1 0 00-1 1"
                        />
                      </svg>
                      <span className="hidden min-[420px]:inline">Delete</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
