import React, { useState } from "react";

interface MyChatMessageProps {
  avatarUrl: string;
  name: string;
  time: string;
  message: string;
  status?: string;
}

const MyChatMessage: React.FC<MyChatMessageProps> = ({
  avatarUrl,
  name,
  time,
  message,
  status = "Seen",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  return (
    <div className="flex items-start justify-end gap-2.5">
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
          type="button"
        >
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 4 15"
          >
            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute left-0 z-10 mt-2 w-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {["Reply", "Edit", "Copy", "Delete"].map((action) => (
                <li key={action}>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {action}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 w-full max-w-[320px] items-end text-right">
        <div className="flex items-center space-x-2 rtl:space-x-reverse justify-end">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {name}
          </span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {time}
          </span>
        </div>

        <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-blue-100 rounded-s-xl rounded-se-xl dark:bg-blue-700">
          <p className="text-sm font-normal text-gray-900 dark:text-white">
            {message}
          </p>
        </div>

        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {status}
        </span>
      </div>

      <img
        className="w-8 h-8 rounded-full"
        src={avatarUrl}
        alt={`${name} image`}
      />
    </div>
  );
};

export default MyChatMessage;
