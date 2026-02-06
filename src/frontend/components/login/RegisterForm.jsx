import { useState } from "react";
import { showToast } from "../../utils/toast.js"

export default function RegisterForm({ setView, setUsernameLogin, setPasswordLogin }) {
  const [usernameRegister, setUsernameRegister] = useState("");
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  async function isUsernameAvailable(username) {
    const res = await fetch(`http://localhost:3000/users/check-username?username=${username}`);
    const data = await res.json();
    return data.available;
  }

  function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  async function isEmailAvailable(email) {
    const res = await fetch(`http://localhost:3000/users/check-email?email=${email}`);
    const data = await res.json();
    return data.available;
  }

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(await isUsernameAvailable(usernameRegister))) {
      showToast("Oops! That username is already taken", "error");
      return;
    }

    if (!validateEmailFormat(emailRegister)) {
      showToast("Please check your email address format", "error")
      return
    }

    if (!(await isEmailAvailable(emailRegister))) {
      showToast("That email address is already registered", "error");
      return;
    }

    if (!validatePassword(passwordRegister)) {
      showToast("Password must include letters, numbers, and a capital letter", "error")
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"}, 
        body: JSON.stringify({username: usernameRegister, email: emailRegister, password: passwordRegister})
      });

      if (res.ok) {
        setUsernameLogin(usernameRegister); 
        setPasswordLogin(passwordRegister);
        setUsernameRegister("");
        setEmailRegister("");
        setPasswordRegister("");
        showToast("Account created successfully!", "success")
        setView("login"); 
      }
      else {
        showToast("Registration failed. Please try again.", "error");
      }
    } 
    catch (err) {
      showToast("Server errror. Try again later.", "error")
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="registration-header">
        <ion-icon name="arrow-back" id="registerBackIcon" onClick={() => {setView("login"); setUsernameRegister(""); setEmailRegister(""); setPasswordRegister("") }}></ion-icon>
        <h1>Create Account</h1>
      </div>

      <div className="inputbox">
        <ion-icon name="person-outline"></ion-icon>
        <input type="text" autoComplete="off" required value={usernameRegister} onChange={(e) => setUsernameRegister(e.target.value)}/>
        <label>Username</label>
      </div>

      <div className="inputbox">
        <ion-icon name="mail-outline"></ion-icon>
        <input type="text" autoComplete="off" required value={emailRegister} onChange={(e) => setEmailRegister(e.target.value)}/>
        <label>Email</label>
      </div>

      <div className="inputbox">
        <ion-icon name="lock-closed-outline"></ion-icon>
        <input type="password" autoComplete="off" required value={passwordRegister} onChange={(e) => setPasswordRegister(e.target.value)}/>
        <label>Password</label>
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
