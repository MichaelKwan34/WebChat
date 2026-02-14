import InactiveView from "./InactiveView";
import ActiveChat from "./ActiveChat";

export default function ChatArea({ socket, currentUser, activeChat, conversationId, messages, setMessages, setChats, friends, setFriends, nicknames, setNicknames }) {
  return (
    <div className="right-side">
      {!activeChat && <InactiveView socket={socket} currentUser={currentUser} activeChat={activeChat} setMessages={setMessages} setChats={setChats}/>}
      {activeChat && <ActiveChat 
                        socket={socket} 
                        currentUser={currentUser} 
                        activeChat={activeChat} 
                        conversationId={conversationId} 
                        messages={messages}
                        setMessages={setMessages} 
                        setChats={setChats} 
                        friends={friends} 
                        setFriends={setFriends}
                        nicknames={nicknames} 
                        setNicknames={setNicknames}
                        />}
    </div>
  );
}