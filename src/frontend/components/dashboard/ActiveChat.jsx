import { useState, useRef, useEffect } from "react";

export default function ActiveChat({ currentUser, activeChat, conversationId, messages, setMessages, setChats }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    const trimmedText = text.trim();

    try {
      const res = await fetch(`http://localhost:3000/messages/${conversationId}`, {
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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

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

    await fetch(`http://localhost:3000/users/${currentUser}/update-chats`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat: activeChat })
    });

    // TODO: socket.emit("private_message", {from: currentUser, to: activeMessageName, text: msg, time: data.timeSent})

    } catch (err) {
      console.log(err.message)
  }};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
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
