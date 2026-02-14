import { useState } from "react";
import "../../contactModal.css"; 
import { arrowForwardOutline } from 'ionicons/icons';
import { showToast } from "../../utils/toast.js"

const ContactModal = ({ isOpen, onClose, activeChat, setFriends, currentUser, setNicknames}) => {
  if (!isOpen) return null;

  const [rename, setRename] = useState("");

  const handleRename = async () => {
    try {
      const res = await fetch(`/api/users/${currentUser}/rename`, {
        method: "PUT",
        headers: {
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
    console.log("DELETE")
    onClose();
  }

  const handleRemove = async () => {
    setFriends(prev => prev.filter(friend => friend !== activeChat));
    try {
      const res = await fetch(`/api/users/${currentUser}/remove-friend`, {
        method: "PUT",
        headers: {
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

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div className="contact-content" onClick={(e) => e.stopPropagation()}>
        <h2>Contact</h2>
        <div className="contact-inputs">
          <input type="text"  value={activeChat} readOnly/> 
          <ion-icon className="arrow-right" icon={arrowForwardOutline} />
          <input type="text" placeholder="" value={rename} onChange={(e) => {setRename(e.target.value)}}/>
        </div>

        <div className="contact-buttons single-button">
          <button onClick={handleRename}>Rename</button>
        </div>

        <div className="contact-buttons two-buttons">
          <button onClick={handleRemove}>Remove Friend</button>
          <button onClick={handleDelete}>Delete Chat</button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;