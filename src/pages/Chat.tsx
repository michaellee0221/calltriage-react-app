import { useEffect, useState } from "react";
import { db } from "../firebase";
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
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import ChatMessage from "../components/ChatMessage";
import MyChatMessage from "../components/MyChatMessage";
import { useLocation } from "react-router-dom";

interface Message {
  sender: string;
  recipient: string;
  type: string;
  messageText: string;
  attachUrl: string;
  timestamp: unknown;
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
      console.log("Messages updated:", newMessages);
    });

    return () => unsubscribe();
  }, [profileId, appUserId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      sender: profileId,
      recipient: appUserId,
      type: "0",
      messageText: message,
      attachUrl: "",
      timestamp: serverTimestamp(),
    });

    setMessage("");
  };

  return (
    <div className="p-4 dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="mb-4 text-white">
        {otherUser ? (
          <div className="flex items-center gap-2">
            <img
              src={otherUser.profile_image_url}
              alt="avatar"
              className="w-10 h-10 rounded-full"
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

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((msg, index) =>
          msg.sender === profileId ? (
            <MyChatMessage
              key={index}
              avatarUrl="/docs/images/people/profile-picture-2.jpg"
              name={username || "You"}
              time={new Date(msg.timestamp?.toDate()).toLocaleTimeString()}
              message={msg.messageText}
              status="Sent"
            />
          ) : (
            <ChatMessage
              key={index}
              avatarUrl={otherUser?.profile_image_url || ""}
              name={`${otherUser?.firstName || "Friend"}`}
              time={new Date(msg.timestamp?.toDate()).toLocaleTimeString()}
              message={msg.messageText}
              status="Delivered"
            />
          )
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg px-4 py-2 text-black"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
