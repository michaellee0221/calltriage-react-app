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
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ChatMessage from "../components/ChatMessage";
import MyChatMessage from "../components/MyChatMessage";
import { useLocation } from "react-router-dom";

interface Message {
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
      const newMessages = snapshot.docs.map((doc) => ({
        ...(doc.data() as Message),
      }));
      setMessages(newMessages);

      // Auto scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
  };

  return (
    <div className="flex flex-col h-screen dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900 p-4 mb-2 text-white shadow-md">
        {otherUser ? (
          <div className="flex items-center gap-3">
            <img
              src={otherUser.profile_image_url}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-lg font-semibold">
                {otherUser.firstName} {otherUser.lastName}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm">Loading user info...</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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
            />
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      {imageFile && (
        <div className="relative inline-block">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="Preview"
            className="max-w-xs max-h-40 rounded-md"
          />

          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md">
              <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
            </div>
          )}
        </div>
      )}

      {/* Input Field */}
      <div className="p-3 bg-gray-800 flex items-center gap-2 shadow-inner">
        <label className="cursor-pointer text-gray-300 hover:text-white text-xl">
          📎
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

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl px-4 py-2 text-black focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-white transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Scroll to bottom button */}
      <button
        onClick={() =>
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
        className="fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg"
      >
        ↓
      </button>
    </div>
  );
}

export default Chat;
