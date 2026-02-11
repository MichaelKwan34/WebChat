import { useState, useRef, useEffect } from "react";

export default function ActiveChat({ socket, currentUser, activeChat, conversationId, messages, setMessages, setChats }) {
  const [loadingSend, setLoadingSend] = useState(false);

  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (loadingSend) return;
    setLoadingSend(true);
    
    const trimmedText = text.trim();

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { 
          "Content-Type" : "application/json",
        },
        body: JSON.stringify({
          sender: currentUser,
          msg: trimmedText,
          receiver: activeChat
        })
      });

      if (!res.ok) {
        throw new Error(data.message);
      }

      const data = await res.json();

      setText("");
      setMessages(prevMessages => [
        ...prevMessages,
        {
          sender: currentUser,
          text: trimmedText,
          createdAt: new Date().toISOString()
        }
      ]);

      setChats(prevChats => {
        const filtered = prevChats.filter(chat => chat !== activeChat);
        return [activeChat, ...filtered]
      });

      await fetch(`/api/users/${currentUser}/update-chats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat: activeChat })
      });

      socket.emit("private_message", {from: currentUser, to: activeChat, text: trimmedText, time: data.timeSent})
    } catch (err) {
      showToast("Failed to send a message", "error");
    } finally {
      setLoadingSend(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = ({ from, to, text, time }) => {
      if (from === activeChat && to === currentUser) {
        setMessages(prev => [...prev, { sender: from, text, createdAt: time }]);
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
  }, [socket, activeChat, currentUser, setMessages, setChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatMessageTime(dateStr) {
    const msgDate = new Date(dateStr);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    const startOfWeekAgo = new Date(startOfToday);
    startOfWeekAgo.setDate(startOfToday.getDate() - 7);

    const timeFormat = { hour: '2-digit', minute: '2-digit', hour12: false};

    if (msgDate >= startOfToday) return `Today, ${msgDate.toLocaleTimeString([], timeFormat)}`;
    else if (msgDate >= startOfYesterday) return `Yesterday, ${msgDate.toLocaleTimeString([], timeFormat)}`;
    else if (msgDate >= startOfWeekAgo) return `${msgDate.toLocaleDateString([], { weekday: 'long' })}, ${msgDate.toLocaleTimeString([], timeFormat)}`;
    else return `${msgDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}, ${msgDate.toLocaleTimeString([], timeFormat)}`;
  }

  return (
    <div className="active-view">
      <div className="right-side-header">
        <label>{activeChat}</label>
      </div>

      <div className="messages">
      {messages.map((msg, index) => {
            const messageClass = msg.sender === currentUser ? "sent" : "received";

            return (
              <div key={index} className={`message ${messageClass}`}>
                <p className="message-content">{msg.text}</p>
                <span className="message-time">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input type="text" autoComplete="off" placeholder="Type a message..." value={text} 
               onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSend()}/>

        <button className="send-btn" aria-label="Send message" onClick={handleSend}>
          <ion-icon name="send-sharp" />
        </button>
      </div>
    </div>
  );
}
