import { useState, useRef, useEffect } from "react";
import { showToast } from "../../utils/toast.js"
import { closeCircleOutline } from "ionicons/icons";
import ContactModal from "./ContactModal";

export default function ActiveChat({ socket, currentUser, activeChat, setActiveChat, setActiveFriend, conversationId, messages, setMessages, setChats, friends, setFriends, nicknames, setNicknames, replyingTo, setReplyingTo }) {
  const [loadingSend, setLoadingSend] = useState(false);

  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [friendStatus, setFriendStatus] = useState({});
  const [typingStatus, setTypingStatus] = useState({});

  const handleSend = async () => {
    if (loadingSend) return;
    setLoadingSend(true);
    
    const trimmedText = text.trim();

    try {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = (localToken ? localToken : sessionToken);

      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
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

      await fetch(`/api/users/update-chats`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ activeChat: activeChat })
      });

      socket.emit("private_message", {from: currentUser, to: activeChat, text: trimmedText, time: data.timeSent});
      socket.emit("typing", { to: activeChat, isTyping: false });
    } catch (err) {
      showToast("Failed to send a message", "error");
    } finally {
      setLoadingSend(false);
    }
  };

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
    else {
      const day = msgDate.getDate();
      const month = msgDate.toLocaleString('default', { month: 'short' });
      const year = msgDate.getFullYear();
      return `${month} ${day} (${year}), ${msgDate.toLocaleTimeString([], timeFormat)}`;
    }
  }

  useEffect(() => {
    const handleOnlineStatus = ({ user, isOnline }) => {
      setFriendStatus(prev => ({ ...prev, [user]: isOnline }));
    };

    const handleTyping = ({ user, isTyping }) => {
      setTypingStatus(prev => ({ ...prev, [user]: isTyping }));
    };

    socket.on("online_status_result", handleOnlineStatus);
    socket.on("is_typing_result", handleTyping);
    return () => {
      socket.off("online_status_result", handleOnlineStatus);
      socket.off("is_typing_result", handleTyping);
    }
  }, [socket]);

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <div className="active-view">
      <div className="right-side-header" onClick={openModal}>
        <ion-icon name="radio-button-on" className="onlineStatus" style={friendStatus[activeChat] ? {color: "#499167"} : {color: "#c76767"}}/>
         <span>
          {capitalizeFirstLetter(nicknames[activeChat] || activeChat)}
          {friendStatus[activeChat] && typingStatus[activeChat] && (<span className="typing-text"> is typing...</span>)}
        </span>
      </div>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        activeChat={activeChat} 
        setActiveChat={setActiveChat}
        setActiveFriend={setActiveFriend}
        friends={friends}
        setFriends={setFriends} 
        currentUser={currentUser} 
        nicknames={nicknames} 
        setNicknames={setNicknames}
        setMessages={setMessages}
        conversationId={conversationId}
        setChats={setChats}
        ></ContactModal>

      <div className="messages">
        {messages.map((msg, index) => {
          const messageClass = msg.sender === currentUser ? "sent" : "received";
          return (
            <div key={index} className={`message-row ${messageClass}`} onDoubleClick={() => setReplyingTo({messageClass, msg, activeChat})} >
               <div className={`message ${messageClass}`}>
                  <p className="message-content">{msg.text}</p>
                  <span className="message-time">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
            </div>
          );
          })}
          <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="reply-preview" style={
          {
            borderColor: replyingTo.messageClass === "sent" ? "rgb(94, 192, 164)" : "#ffcb78"
          }
        }>
          <h3>{capitalizeFirstLetter(replyingTo.messageClass === "sent" ? "you" : nicknames[replyingTo.activeChat] || replyingTo.activeChat)}</h3>
          
          <div className="reply-row">
            <p>{replyingTo.msg.text.length > 115 ? replyingTo.msg.text.slice(0, 115) + "..." : replyingTo.msg.text}</p>
            <ion-icon className="close-circle-icon" icon={closeCircleOutline} onClick={() => setReplyingTo(null)} />
          </div>
        </div>
      )}

      <div className="message-input">
        <input type="text" autoComplete="off" placeholder="" value={text} 
               onChange={(e) => {
                setText(e.target.value);
                if (e.target.value !== "") socket.emit("typing", { to: activeChat, isTyping: true });
                else socket.emit("typing", { to: activeChat, isTyping: false });
               }}
               onKeyDown={(e) => e.key === "Enter" && handleSend()}/>

        <button className="send-btn" aria-label="Send message" onClick={handleSend}>
          <ion-icon name="send-sharp" />
        </button>
      </div>
    </div>
  );
}