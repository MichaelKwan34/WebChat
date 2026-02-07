import { useState } from "react";
import { showToast } from "../../utils/toast.js"

export default function ForgotForm({ setView, emailReset, setEmailReset }) {
  const [loading, setLoading] = useState(false);

  function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return
    setLoading(true)

    const email = emailReset.trim().toLowerCase();

    if (!email) {
      showToast("Please enter your email", "error");
      setLoading(false);
      return;
    }

    if (!(validateEmailFormat(email))) {
      showToast("Please check your email address format", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, "success")
        setView("otp");
      } else {
        showToast("Something went wrong. Please try again.", "error")
      }
    } catch (err) {
      showToast("Server error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="forgot-header">
        <ion-icon name="arrow-back" id="resetBackIcon" onClick={() => {setView("login"); setEmailReset("") }}></ion-icon>
        <h1>Reset Password</h1>
      </div>

      <div className="inputbox">
        <ion-icon name="mail-outline"></ion-icon>
        <input type="text" autoComplete="off" required value={emailReset} onChange={(e) => setEmailReset(e.target.value)}/>
        <label>Email</label>
      </div>

      <button type="submit" disabled={loading}>Continue</button>
    </form>
  );
}
