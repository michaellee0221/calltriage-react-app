import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

interface Message {
    text: string;
    timestamp: Date;
    senderId: string;
    senderName: string;
}

function Chat() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
        setMessages(newMessages);
        console.log('✅ Fetched messages:', newMessages);
        });
        return () => unsubscribe();
    }, []);

    const handleSendMessage = () => {
        if (message.trim() === '') return;

        const newMessage: Message = {
            text: message,
            timestamp: new Date(),
            senderId: auth.currentUser?.uid || '',
            senderName: auth.currentUser?.displayName || '',
        };

        setMessages([...messages, newMessage]);
        setMessage('');
    };

    return (
        <div>
            <h1>Chat</h1>
            <div>
                {messages.map((message) => (
                    <div key={message.timestamp.toString()}>
                        <span>{message.senderName}</span>
                        <span>{message.text}</span>
                    </div>
                ))}
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    )
}

export default Chat;