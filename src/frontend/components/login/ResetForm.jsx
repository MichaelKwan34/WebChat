import { useState } from "react";
import { showToast } from "../../utils/toast.js";

export default function ResetForm({ setView, emailReset, setEmailReset }) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("")

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  async function changePassword(email, password) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });

    if (!res.ok) {
      throw new Error("Change password failed");
    }
    return res.json();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return
    setLoading(true)

    const email = emailReset.trim().toLowerCase();

    if (validatePassword(newPassword)) {
      const res = await changePassword(email, newPassword);
      setEmailReset("");
      setNewPassword("");
      showToast(res.message, "success")
      setView("login");
    } else {
      showToast("Password must include letters, numbers, and a capital letter", "error");
    }
    setLoading(false)
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="reset-header">
        <ion-icon name="arrow-back" id="newPassBackIcon" onClick={() => {setView("otp"); setNewPassword("")}}></ion-icon>
        <h1>New Password</h1>
      </div>

      <div className="inputbox">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input type="password" autoComplete="off" required value={newPassword} onChange={(e) => {setNewPassword(e.target.value)}}/>
        <label>Password</label>
      </div>

      <button type="submit" disabled={loading}>Reset</button>
    </form>
  );
}