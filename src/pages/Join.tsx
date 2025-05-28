import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/callTriage_logo.png";

function Join() {
  const { profileId } = useParams();
  console.log("profileId:", profileId);
  const [username, setUsername] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!profileId || username.trim() === "" || code.trim() === "") {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    console.log(
      "Joining with profileId:",
      profileId,
      "username:",
      username,
      "code:",
      code
    );
    try {
      const userRef = doc(db, "user_profiles", profileId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.code === code) {
          await updateDoc(userRef, {
            firstName: username,
          });

          navigate(`/chat`, {
            state: {
              profileId,
              appUserId: data.appUserId ?? null,
              username,
            },
          });
        } else {
          setErrorMessage("Verification code is incorrect.");
        }
      } else {
        setErrorMessage("User profile not found.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-red-700">
      {/* 🔔 Error Alert at Top */}
      {errorMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
          <div
            className="flex items-center p-4 m-4 text-sm text-red-800 rounded-lg bg-red-50 shadow-lg dark:bg-gray-800 dark:text-red-400 w-full max-w-lg"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 mr-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.257 3.099c.763-1.36 2.683-1.36 3.446 0l6.514 11.616c.75 1.338-.213 3.01-1.723 3.01H3.466c-1.51 0-2.473-1.672-1.723-3.01L8.257 3.1zM11 13a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm-.25-5a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0V8z" />
            </svg>
            <div className="flex justify-between items-center w-full">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-4 text-sm font-medium text-red-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-sm px-6 sm:px-2 flex flex-col items-center">
        {/* Logo above the box */}
        <div className="mb-12">
          <img
            src={logo} // ⬅️ Replace with actual path
            alt="Logo"
            className="w-48 sm:w-56 md:w-64 h-auto"
          />
        </div>

        {/* Form Box */}
        <div className="w-full bg-red-600 border border-red-600 rounded-lg shadow p-6 pt-10 pb-10">
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                UserName
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-red-300 border border-red-400 text-black text-sm placeholder-gray-500 rounded-lg focus:ring-red-200 focus:border-red-300 block w-full p-2.5"
                required
              />
            </div>
            <div>
              <label className="block mb-2 mt-6 text-sm font-medium text-white">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-red-300 border border-red-400 text-black text-sm placeholder-gray-500 rounded-lg focus:ring-red-200 focus:border-red-300 block w-full p-2.5"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleJoin}
              className="w-full mt-8 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-red-200 font-medium rounded-lg text-md px-5 py-2.5 text-center"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Join;
