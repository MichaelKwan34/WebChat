import InactiveView from "./InactiveView";
import ActiveChat from "./ActiveChat";

export default function ChatArea({ currentUser, activeChat, conversationId, messages, setMessages, setChats }) {
  return (
    <div className="right-side">
      {!activeChat && <InactiveView/>}
      {activeChat && <ActiveChat currentUser={currentUser} activeChat={activeChat} conversationId={conversationId} messages={messages} setMessages={setMessages} setChats={setChats}/>}
    </div>
  );
}
