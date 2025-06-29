import { useEffect, useRef, useState } from "react";
import { db, storage } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  orderBy,
  query,
  where,
  addDoc,
  serverTimestamp,
  or,
  and,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ChatMessage from "../components/ChatMessage";
import MyChatMessage from "../components/MyChatMessage";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  sender: string;
  recipient: string;
  type: string;
  messageText: string;
  attachUrl: string;
  timestamp: Timestamp;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  profile_image_url: string;
  telnyxAssignedPhoneNumber: string;
}

function Chat() {
  const location = useLocation();
  const { profileId, appUserId, username } = location.state || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch other user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!appUserId) return;
      const userRef = doc(db, "user_profiles", appUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setOtherUser(userSnap.data() as UserProfile);
      }
    };
    fetchUserProfile();
  }, [appUserId]);

  useEffect(() => {
    // Auto scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Listen to messages
  useEffect(() => {
    const messagesRef = collection(db, "messages");

    const q = query(
      messagesRef,
      or(
        and(
          where("sender", "==", profileId),
          where("recipient", "==", appUserId)
        ),
        and(
          where("sender", "==", appUserId),
          where("recipient", "==", profileId)
        )
      ),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender || "",
          recipient: data.recipient || "",
          type: data.type || "0",
          messageText: data.messageText || "",
          attachUrl: data.attachUrl || "",
          timestamp: data.timestamp || Timestamp.now(),
        } as Message;
      });
      setMessages(newMessages);

      console.log("Messages updated:", newMessages);
    });

    return () => unsubscribe();
  }, [profileId, appUserId]);

  const uploadImageAndSend = async () => {
    if (!imageFile) return;

    try {
      setLoading(true);

      const fileRef = ref(
        storage,
        `messages/${profileId}/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(fileRef, imageFile);
      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, "messages"), {
        sender: profileId,
        recipient: appUserId,
        type: "1",
        messageText: "",
        attachUrl: downloadURL,
        timestamp: serverTimestamp(),
      });

      setImageFile(null);
      // Auto scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (imageFile) {
      await uploadImageAndSend();
      return;
    }

    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      sender: profileId,
      recipient: appUserId,
      type: "0", // text type
      messageText: message,
      attachUrl: "",
      timestamp: serverTimestamp(),
    });

    setMessage("");
    // Auto scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteMessage = async (id: string) => {
    // Delete from Firestore or your state
    await deleteDoc(doc(db, "messages", id)); // Example for Firestore
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-red-700 px-safe pb-[env(safe-area-inset-bottom)]">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-red-700 p-2 mb-2 text-white shadow-md">
        {otherUser ? (
          <div className="flex items-center gap-3">
            <img
              src={otherUser.profile_image_url}
              alt="avatar"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-lg font-semibold">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-gray-300">
                {otherUser.telnyxAssignedPhoneNumber}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex rounded-md">
            <div className="w-10 h-10 border-4 border-gray-50 border-dashed rounded-full animate-spin border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 max-h-[calc(100vh-170px)]">

        {messages.map((msg, index) =>
          msg.sender === profileId ? (
            <MyChatMessage
              key={index}
              avatarUrl="/default-avatar.png"
              name={username || "You"}
              time={msg.timestamp
                ?.toDate()
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              message={msg.messageText}
              type={msg.type || "0"}
              attachUrl={msg.attachUrl || ""}
              onDelete={() => handleDeleteMessage(msg.id)}
            />
          ) : (
            <ChatMessage
              key={index}
              avatarUrl={otherUser?.profile_image_url || ""}
              name={""}
              time={msg.timestamp
                ?.toDate()
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              message={msg.messageText}
              type={msg.type || "0"}
              attachUrl={msg.attachUrl || ""}
              onDelete={() => handleDeleteMessage(msg.id)}
            />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="bg-red-500 rounded-lg flex-col gap-2 mt-1 shadow-inner flex-shrink-0">

        {imageFile && (
          <div className="relative p-2 pb-0 inline-block justify-center flex items-center">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className={`w-auto max-h-20 rounded-md object-contain ${
                loading ? "blur-sm" : ""
              }`}
            />

            {loading && (
              <div className="absolute inset-2 flex items-center justify-center rounded-md">
                <div className="w-10 h-10 border-4 border-red-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 p-3 rounded-full w-full max-w-full mx-auto">
          {/* Image Toggle */}
          {imageFile ? (
            <button
              onClick={() => setImageFile(null)}
              className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-white border border-white flex items-center justify-center"
              title="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <label className="cursor-pointer text-sm">
              <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-white border border-white flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-auto text-red-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8.414a2 2 0 00-.586-1.414l-3.414-3.414A2 2 0 0012.586 3H4zm8 1.5L16.5 9H13a1 1 0 01-1-1V4.5zM4 13l3-3 2 2 4-4 3 3v3H4z" />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    setImageFile(file);
                  } else {
                    alert("Only image files are allowed!");
                  }
                }}
              />
            </label>
          )}

          {/* Message Input */}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !loading) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-grow min-w-0 rounded-lg px-2 sm:px-3 py-2 text-black text-sm focus:outline-none placeholder-gray-500 bg-white"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={loading}
            className={`flex items-center justify-center w-8 h-8 min-w-8 min-h-8 rounded-full transition ${
              loading
                ? "bg-red-300 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-red-100 text-red-600"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>

      </div>

      {/* Scroll to bottom button */}
      <button
        onClick={() =>
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
        className="hidden inline-flex fixed bottom-24 right-10 items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50"
      >
        <svg
          className="w-6 h-6 text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M5 1v12m0 0 4-4m-4 4L1 9"
          />
        </svg>
      </button>
    </div>
  );
}

export default Chat;
