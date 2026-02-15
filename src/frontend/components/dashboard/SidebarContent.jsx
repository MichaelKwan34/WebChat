import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { showToast } from "../../utils/toast.js"

export default function SidebarContent({ socket, currentUser, activeTab, activeFriend, setActiveFriend, activeChat, setActiveChat, friends, setFriends, chats, setChats, currentSearch, setConversationId, setMessages, unreadCounts, setUnreadCounts, nicknames, setNicknames, replyingTo, setReplyingTo }) {
  const navigate = useNavigate();
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAddContact, setLoadingAddContact] = useState(false);

  const [searchedUsername, setSearchedUsername] = useState("");
  const [searchInfo, setSearchInfo] = useState("information")
  const [status, setStatus] = useState("");
  const [infoVisible, setInfoVisible] = useState("");
  const [addVisible, setAddVisible] = useState("");
  const [msgVisible, setMsgVisible] = useState("");

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/", { replace: true })
  };

  const handleFriendClick = async (friend) => {
    if (loadingChat) return;

    setLoadingChat(true);

    try {
      const resConversationId = await fetch(`/api/conversations/${currentUser}/${friend}`);
      const dataConversationId = await resConversationId.json();
      setConversationId(dataConversationId.conversationId);

      const resMsg = await fetch(`/api/messages/${dataConversationId.conversationId}`)
      const dataMsg = await resMsg.json();

      const filterDeletedMsg = dataMsg.filter(msg => !msg.deleteBy.includes(currentUser));
      setMessages(filterDeletedMsg);
      setActiveFriend(friend);
      setActiveChat(friend);

      await fetch(`/api/users/${currentUser}/reset-unread`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeChat: friend })
      });

      setUnreadCounts(prev => ({ ...prev, [friend]: 0 }));

      replyingTo && replyingTo.activeChat !== friend && setReplyingTo(null)
    } catch (err) {
      showToast("Failed to load conversation", "error");
    } finally {
      setLoadingChat(false);
    }
  }

  const handleChatClick = async (chat) => {
    handleFriendClick(chat);
  }

  function isValidCharacters(str) {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(str);
  }
  
  const handleSearch = async (username) => {
    if (loadingSearch) return;

    if (!isValidCharacters(username)) {
      setSearchInfo("User not found")
      setAddVisible(false);
      setMsgVisible(false);
      setStatus("not-found");
      return;
    }

    setLoadingSearch(true);

    try {
      const res = await fetch (`/api/users/find-user/${currentUser}/${username}`);

      if (!res.ok) {
        throw new Error("Search failed");
      }

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
      } else {
        setSearchInfo("User not found")
        setAddVisible(false);
        setMsgVisible(false);
        setStatus("not-found");
      }
    } catch (err) {
      showToast("Search failed", "error");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAddContact = async () => {
    if (loadingAddContact) return;

    setLoadingAddContact(true);

    try {
       const res = await fetch(`/api/users/add-contact/${currentUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({searchedUsername: searchedUsername})
      });

      if (!res.ok) {
        throw new Error("Request to add contact failed");
      }

      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        setSearchInfo(`'${searchedUsername}' is already your friend`);
        setAddVisible(false);
        fetchFriends();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Add contact failed", "error");
    } finally {
      setLoadingAddContact(false);
    }
  }

  async function fetchFriends() {
    try {
      const res = await fetch(`/api/users/${currentUser}/friends`);
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data.friends);
      setNicknames(data.nicknames || {});
    } catch (err) {
      showToast("Failed to fetch friends", "error");
    }
  }

  async function fetchChats() {
    try {
      const res = await fetch(`/api/users/${currentUser}/chats`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data.chats);
      setUnreadCounts(data.unreadCounts || {});
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

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }

  if (activeTab === "friends") {
     const mappedFriends = friends.map(friend => ({
      original: friend,
      display: nicknames[friend] || friend
    }));

    const filteredFriends = mappedFriends.filter(item =>
      item.display.toLowerCase().includes(currentSearch.toLowerCase())
    );

    const sortedFriends = filteredFriends.sort((a, b) =>
      a.display.toLowerCase().localeCompare(b.display.toLowerCase())
    );

    return (
      <ul id="friend-lists">
        {sortedFriends.map(({original, display}) => (
          <li
            key={original}
            className={original === activeFriend ? "active" : ""}
            onClick={() => handleFriendClick(original)}
          >
            {capitalizeFirstLetter(display)}
          </li>
        ))}
      </ul>
    );
  }

  if (activeTab === "chats") {
    const mappedChats = chats.map(chat => ({
      original: chat,
      display: nicknames[chat] || chat
    }));

    const filteredChats = mappedChats.filter(item =>
      item.display.toLowerCase().includes(currentSearch.toLowerCase())
    );

    return (
      <ul id="chat-lists">
        {filteredChats.map(({ original, display }) => (
          <li
            key={original}
            className={original === activeChat ? "active" : ""}
            onClick={() => handleChatClick(original)}
          >
            {capitalizeFirstLetter(display)}
            {unreadCounts[original] > 0 && (
              <span className="unread"> 
                  ({unreadCounts[original] })
              </span>
            )}
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
            <input type="text" autoComplete="off" placeholder="Search" value={searchedUsername} disabled={loadingSearch}
                  onChange={(e) => { 
                    const val = e.target.value.toLowerCase();
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
            <button className={addVisible ? "button-visible" : "button-hidden"} onClick={handleAddContact} disabled={loadingAddContact}>Add</button>
            <button className={msgVisible ? "button-visible" : "button-hidden"} onClick={(e) => handleChatClick(searchedUsername)} disabled={loadingChat}>Message</button>
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