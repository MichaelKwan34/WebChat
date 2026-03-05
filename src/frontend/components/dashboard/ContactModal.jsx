import { useState } from "react";
import "../../contactModal.css"; 
import { arrowForwardOutline } from 'ionicons/icons';
import { showToast } from "../../utils/toast.js"

const ContactModal = ({ isOpen, onClose, activeChat, setActiveChat, setActiveFriend, friends, setFriends, nicknames, setNicknames, setMessages, conversationId, setChats}) => {
  if (!isOpen) return null;

  const [rename, setRename] = useState("");
  const [isFriend, setIsFriend] = useState(false);

  const handleRename = async () => {
    try {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = (localToken ? localToken : sessionToken);

      const res = await fetch(`/api/users/rename`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeChat, nickname: rename }),
      });

      if (!res.ok) {
        throw new Error("Failed to update friends on server");
      }

      const data = await res.json();
      showToast(data.message, "success");
      setNicknames(prev => ({ ...prev, [activeChat]: rename }));
    } catch (err){
      showToast(err, "error");
    } finally {
      onClose();
    }
  }

  const handleDelete = async () => {
    try {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = (localToken ? localToken : sessionToken);

      const resDelete = await fetch(`/api/messages/${conversationId}/delete-chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ activeChat })
      });

      if (!resDelete.ok) {
        throw new Error("Failed to delete messages");
      }

      const resRemove = await fetch(`/api/users/remove-chat`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeChat }),
      });

      if (!resRemove.ok) {
        throw new Error("Failed to remove chat on server");
      }

      const dataDelete = await resDelete.json();
      showToast(dataDelete.message, "success");

      setMessages([]);
      setChats(prevChats => {
        const filtered = prevChats.filter(chat => chat !== activeChat);
        return filtered;
      });
      setActiveChat(null);
      setActiveFriend(null);
    } catch (err) {
      showToast(err, "error");
    } finally {
      onClose();
    }
  }

  const handleRemove = async () => {
    setFriends(prev => prev.filter(friend => friend !== activeChat));
    try {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = (localToken ? localToken : sessionToken);
      
      const res = await fetch(`/api/users/remove-friend`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeChat }),
      });

      if (!res.ok) {
        throw new Error("Failed to update friends on server");
      }
      
      const data = await res.json();
      showToast(data.message, "success");
    } catch (err) {
      showToast(err, "error");
    } finally {
      onClose();
    }
  }

  async function fetchFriends() {
    try {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = (localToken ? localToken : sessionToken);

      const res = await fetch(`/api/users/friends`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data.friends);
      setNicknames(data.nicknames || {});
    } catch (err) {
      showToast("Failed to fetch friends", "error");
    }
  }

  const handleAdd = async () => {
    try {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      const token = (localToken ? localToken : sessionToken);

      const res = await fetch(`/api/users/add-contact`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({searchedUsername: searchedUsername})
      });

      if (!res.ok) {
        throw new Error("Request to add contact failed");
      }

      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        fetchFriends();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Add contact failed", "error");
    } finally {
      onClose();
    }
  }; 

  useEffect(() => {
    if (friends.includes(activeChat)) setIsFriend(true);
    else setIsFriend(false);
  }, [])

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div className="contact-content" onClick={(e) => e.stopPropagation()}>
        
        <h2>{activeChat}</h2>
        <div className="contact-inputs">
          <input type="text"  value={ nicknames[activeChat] || activeChat } readOnly/>
          <ion-icon className="arrow-right" icon={arrowForwardOutline} />
          <input type="text" value={rename} 
                 onChange={(e) => {setRename(e.target.value)}}
                 onKeyDown={(e) => {if (e.key === "Enter") handleRename();}}
                 />
        </div>

        <div className="contact-buttons single-button">
          <button onClick={handleRename}>Rename</button>
        </div>

        <div className="contact-buttons two-buttons">
          <button onClick={handleRemove} style={isFriend ? {display:""} : {display:"none"}}>Remove Friend</button>
          <button className="addButton" onClick={handleAdd} style={isFriend ? {display:"none"} : {display:""}}>Add Contact</button>
          <button onClick={handleDelete}>Delete Chat</button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;