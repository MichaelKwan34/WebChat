import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { showToast } from "../../utils/toast.js"

export default function SidebarContent({ currentUser, activeTab, activeFriend, setActiveFriend, activeChat, setActiveChat, friends, setFriends, chats, setChats, currentSearch, setConversationId, setMessages }) {
  const navigate = useNavigate();

  const [searchedUsername, setSearchedUsername] = useState("");
  const [searchInfo, setSearchInfo] = useState("information")
  const [status, setStatus] = useState("");
  const [infoVisible, setInfoVisible] = useState("");
  const [addVisible, setAddVisible] = useState("");
  const [msgVisible, setMsgVisible] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/", { replace: true })
    // TODO: socket.disconnect();
  };

  const filterList = (list) => {
    if (!currentSearch.trim()) return list
    return list.filter(item => item.toLowerCase().includes(currentSearch.toLowerCase()));
  };

  const handleFriendClick = async (friend) => {
    try {
      const resConversationId = await fetch(`http://localhost:3000/conversations/${currentUser}/${friend}`);
      const dataConversationId = await resConversationId.json();
      setConversationId(dataConversationId.conversationId);

      const resMsg = await fetch(`http://localhost:3000/messages/${dataConversationId.conversationId}`)
      const dataMsg = await resMsg.json();
      setMessages(dataMsg)
      
      setActiveFriend(friend);
      setActiveChat(friend);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleChatClick = async (chat) => {
    handleFriendClick(chat)
  }

  const handleSearch = async (username) => {
    const res = await fetch (`http://localhost:3000/users/find-user/${currentUser}/${username}`);
    const data = await res.json();

    setInfoVisible(true);
    setAddVisible(true);
    setMsgVisible(true);
    setStatus("found");
    setSearchedUsername(username);

    if (data.exists) {
      if (data.user.friends.includes(username)) {
        setSearchInfo(`'${data.searchedUser}' is already your friend`);
        setAddVisible(false);
      }
      else if (data.searchedUser === currentUser) {
        setSearchInfo("You can't add youself");
        setAddVisible(false);
        setMsgVisible(false);
        setStatus("");
      }
      else if (data.searchedUser !== currentUser) {
        setSearchInfo(`Found: ${username}`);
      }
    }
    else {
      setSearchInfo("User not found")
      setAddVisible(false);
      setMsgVisible(false);
      setStatus("not-found");
    }
  };

  const handleAddContact = async () => {
    const res = await fetch(`http://localhost:3000/add-contact/${currentUser}`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({searchedUsername: searchedUsername})
    });

    const data = await res.json();

    if (data.success) {
      showToast(data.message, "success");
      setSearchInfo(`'${searchedUsername}' is already your friend`);
      setAddVisible(false);
      fetchFriends();
    }
  }

  async function fetchFriends() {
    try {
      const res = await fetch(`http://localhost:3000/users/${currentUser}/friends`);
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data.friends);
    } catch (err) {
      showToast("Failed to fetch friends", "error");
    }
  }

  async function fetchChats() {
    try {
      const res = await fetch(`http://localhost:3000/users/${currentUser}/chats`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data.chats);
    } catch (err) {
      showToast("Failed to fetch chats", "error");
    }
  }

  useEffect(() => {
    if (currentUser !== "") {
      fetchFriends();
      fetchChats();
    }
  }, [currentUser]);

  if (activeTab === "friends") {
    const filteredFriends = filterList(friends);

    return (
      <ul id="friend-lists">
        {filteredFriends.map((friend) => (
          <li
            key={friend}
            className={friend === activeFriend ? "active" : ""}
            onClick={() => handleFriendClick(friend)}
          >
            {friend}
          </li>
        ))}
      </ul>
    );
  }

  if (activeTab === "chats") {
    const filteredChats = filterList(chats);

    return (
      <ul id="chat-lists">
        {filteredChats.map((chat) => (
          <li
            key={chat}
            className={chat === activeChat ? "active" : ""}
            onClick={() => handleChatClick(chat)}
          >
            {chat}
          </li>
        ))}
      </ul>
    );
  }

  if (activeTab === "add") {
    return (
      <div className="add-contact-container">
        <div className="add-contact-wrapper">
          <div className="search-wrapper search-contact-wrapper">
            <ion-icon name="search-outline" id="search-icon"></ion-icon>
            <input type="text" autoComplete="off" placeholder="Enter username" value={searchedUsername} 
                  onChange={(e) => { 
                    const val = e.target.value;
                    setSearchedUsername(val); 
                    if(val === "") {
                       setInfoVisible(false);
                       setAddVisible(false);
                       setMsgVisible(false);
                    }
                  }}
                  onKeyDown={(e) => { if(e.key === "Enter") handleSearch(searchedUsername.trim()) }}/>
          </div>
          <p className={`${infoVisible ? "visible" : "hidden"} ${status}`} id="searchInfo">{searchInfo}</p>
          <div className="add-or-message">
            <button className={addVisible ? "button-visible" : "button-hidden"} onClick={handleAddContact}>Add</button>
            <button className={msgVisible ? "button-visible" : "button-hidden"} onClick={(e) => handleChatClick(searchedUsername)}>Message</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="logout-container">
        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }
}
