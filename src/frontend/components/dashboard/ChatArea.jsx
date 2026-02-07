import InactiveView from "./InactiveView";
import ActiveChat from "./ActiveChat";

export default function ChatArea({ socket, currentUser, activeChat, conversationId, messages, setMessages, setChats }) {
  return (
    <div className="right-side">
      {!activeChat && <InactiveView socket={socket} currentUser={currentUser} activeChat={activeChat} setMessages={setMessages} setChats={setChats}/>}
      {activeChat && <ActiveChat socket={socket} currentUser={currentUser} activeChat={activeChat} conversationId={conversationId} messages={messages} setMessages={setMessages} setChats={setChats}/>}
    </div>
  );
}
