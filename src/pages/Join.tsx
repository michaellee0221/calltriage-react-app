import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Join() {
  const { profileId } = useParams();
  console.log("profileId:", profileId);
  const [username, setUsername] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!profileId || username.trim() === "" || code.trim() === "") return;

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
          alert("Verification code is incorrect.");
        }
      } else {
        alert("User profile not found.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed py-14 flex w-full h-full bg-gray-700">
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                UserName
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light"
                placeholder="Michael Lee"
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleJoin}
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
