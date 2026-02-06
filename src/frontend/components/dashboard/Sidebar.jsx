import { useState } from "react";
import SidebarHeader from "./SidebarHeader";
import SidebarContent from "./SidebarContent";
import SidebarNav from "./SidebarNav";

export default function Sidebar({ currentUser, activeTab, setActiveTab, activeFriend, setActiveFriend, activeChat, setActiveChat, friends, setFriends, chats, setChats, setConversationId, setMessages }) {
  const [friendsSearch, setFriendsSearch] = useState("");
  const [chatsSearch, setChatsSearch] = useState("");
  const currentSearch = activeTab === "friends" ? friendsSearch : chatsSearch;

  return (
    <div className="left-side">
      <div className="left-content">
        <SidebarHeader 
          activeTab={activeTab}
          currentSearch={currentSearch}
          setFriendsSearch={setFriendsSearch}
          setChatsSearch={setChatsSearch}
          />

        <SidebarContent 
          currentUser={currentUser} 
          activeTab={activeTab}
          activeFriend={activeFriend}
          setActiveFriend={setActiveFriend}
          activeChat={activeChat} 
          setActiveChat={setActiveChat} 
          friends={friends}
          setFriends={setFriends}
          chats={chats}
          setChats={setChats}
          currentSearch={currentSearch}
          setConversationId={setConversationId}
          setMessages={setMessages}
          />
      </div>

      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
  );
}
