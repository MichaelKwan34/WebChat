import { useEffect } from "react";

export default function InactiveView({ socket, currentUser, activeChat, setMessages, setChats }) {

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

  return (
    <div className="inactive-view">
      Start a new conversation!
    </div>
  );
}
