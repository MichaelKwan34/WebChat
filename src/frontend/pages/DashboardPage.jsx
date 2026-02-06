import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar"
import ChatArea from "../components/dashboard/ChatArea";
import "../dashboard.css";
import { showToast } from "../utils/toast.js"

export default function DashboardPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);

  const [activeFriend, setActiveFriend] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) throw new Error("Invalid token");

      const payload = JSON.parse(atob(payloadBase64));
      if (!payload?.username) throw new Error("Invalid payload");

      setCurrentUser(payload.username);
      // TODO: socket.emit("authenticate", token);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
      showToast(err.message, "error");
    }

  }, [navigate]);

  return (
    <section>
      <Sidebar
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
        setMessages={setMessages}
        />

      <ChatArea 
        currentUser={currentUser}
        activeChat={activeChat} 
        conversationId={conversationId}
        messages={messages}
        setMessages={setMessages}
        setChats={setChats}/>
    </section>
  );
}
