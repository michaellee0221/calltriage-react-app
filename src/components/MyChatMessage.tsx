import React from "react";

interface MyChatMessageProps {
  avatarUrl: string;
  name: string;
  time: string;
  message: string;
  type: string;
  attachUrl: string;
}

const MyChatMessage: React.FC<MyChatMessageProps> = ({
  time,
  message,
  type,
  attachUrl,
}) => {
  return (
    <div className="flex items-start justify-end">
      <div className="flex flex-col gap-1 w-full max-w-sm items-end">
        <div className="flex items-center space-x-2 rtl:space-x-reverse justify-end">
          <span className="text-sm font-normal text-gray-50">{time}</span>
        </div>

        {type === "0" && (
          <div className="flex flex-col leading-1.5 p-3 bg-gray-100 rounded-s-xl rounded-ee-xl w-fit max-w-[80%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[60%]">
            <p className="text-sm font-normal text-red-700 break-words whitespace-pre-wrap">
              {message}
            </p>
          </div>
        )}
        {type === "1" && (
          <div className="group relative">
            <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <button
                data-tooltip-target="download-image"
                className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none focus:ring-gray-50"
              >
                <svg
                  className="w-5 h-5 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 18"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                  />
                </svg>
              </button>
              <div
                id="download-image"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-700 rounded-lg shadow-xs opacity-0 tooltip"
              >
                Download image
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
            <img
              src={attachUrl}
              className="rounded-lg max-w-full h-auto max-h-40"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChatMessage;
