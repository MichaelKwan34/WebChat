import { useState } from "react";
import { showToast } from "../../utils/toast.js"

export default function ForgotForm({ setView, emailReset, setEmailReset }) {
  function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(validateEmailFormat(emailReset))) {
      showToast("Please check your email address format", "error")
      return;
    }

    const res = await fetch("http://localhost:3000/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailReset })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success")
      setView("otp");
    } else {
      showToast("Something went wrong. Please try again.", "error")
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

      <button type="submit">Continue</button>
    </form>
  );
}
