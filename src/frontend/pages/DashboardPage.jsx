import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar"
import ChatArea from "../components/dashboard/ChatArea";
import "../dashboard.css";
import { showToast } from "../utils/toast.js"

export default function DashboardPage() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [currentUser, setCurrentUser] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [nicknames, setNicknames] = useState({});

  const [activeFriend, setActiveFriend] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");

    if (!localToken && !sessionToken) {
      navigate("/", { replace: true });
      return;
    }

    const token = (localToken ? localToken : sessionToken)
        
    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) throw new Error("Invalid token");

      const payload = JSON.parse(atob(payloadBase64));
      if (!payload?.username) throw new Error("Invalid payload");

      setCurrentUser(payload.username);

      socketRef.current = io(``, {
        autoConnect: true
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("authenticate", token);
      });
    } catch (err) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/", { replace: true });
      showToast(err.message, "error");
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handlePrivateMessage = ({ from, to, text, time }) => {
      if (from === activeChat && to === currentUser) {
        setMessages(prev => [...prev, { sender: from, text, createdAt: time }]);
        
        fetch(`/api/users/${currentUser}/reset-unread`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activeChat: activeChat })
        });
      } else if (to === currentUser) {
        setUnreadCounts(prev => ({ ...prev,[from]: (prev[from] || 0) + 1}));
      }
      setChats(prevChats => {
        if (!prevChats.includes(from)) return [from, ...prevChats];
        const filtered = prevChats.filter(chat => chat !== from);
        return [from, ...filtered];
      });
    };

    socket.on("private_message", handlePrivateMessage);

    return () => {
      socket.off("private_message", handlePrivateMessage);
    };
  }, [currentUser, activeChat]);

  return (
    <section>
      <Sidebar
        socket={socketRef.current}
        currentUser={currentUser}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeFriend={activeFriend}
        setActiveFriend={setActiveFriend}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        friends={friends}
        setFriends={setFriends}
        chats={chats}
        setChats={setChats}
        setConversationId={setConversationId}
        messages={messages}
        setMessages={setMessages}
        unreadCounts={unreadCounts}
        setUnreadCounts={setUnreadCounts}
        nicknames={nicknames}
        setNicknames={setNicknames}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        />

      <ChatArea 
        socket={socketRef.current}
        currentUser={currentUser}
        activeChat={activeChat} 
        setActiveChat={setActiveChat}
        setActiveFriend={setActiveFriend}
        conversationId={conversationId}
        messages={messages}
        setMessages={setMessages}
        setChats={setChats}
        friends={friends}
        setFriends={setFriends}
        nicknames={nicknames}
        setNicknames={setNicknames}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        />
    </section>
  );
}