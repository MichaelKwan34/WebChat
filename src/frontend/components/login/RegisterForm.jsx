import { useState } from "react";
import { showToast } from "../../utils/toast.js"

export default function RegisterForm({ setView, setUsernameLogin, setPasswordLogin }) {
  const [usernameRegister, setUsernameRegister] = useState("");
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [loading, setLoading] = useState(false);

  async function isUsernameAvailable(username) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/check-username?username=${username}`);
    const data = await res.json();
    return data.available;
  }

  function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  async function isEmailAvailable(email) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/check-email?email=${email}`);
    const data = await res.json();
    return data.available;
  }

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  function isValidUsernameLength(username) {
    return username.length >= 3 && username.length <= 20;
  }

  function isValidUsernameChars(username) {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const username = usernameRegister.trim().toLowerCase();
    const email = emailRegister.trim().toLowerCase();

    if (!isValidUsernameLength(username)) {
      showToast("Username must be 3–20 characters", "error");
      setLoading(false);
      return;
    }

    if (!isValidUsernameChars(username)) {
      showToast("Username can contain only letters, numbers, and _", "error");
      setLoading(false);
      return;
    }

    if (!validateEmailFormat(email)) {
      showToast("Please check your email address format", "error")
      setLoading(false);
      return
    }

    if (!validatePassword(passwordRegister)) {
      showToast("Password must include letters, numbers, and a capital letter", "error")
      setLoading(false);
      return;
    }

    if (!(await isUsernameAvailable(username))) {
      showToast("Oops! That username is already taken", "error");
      setLoading(false);
      return;
    }

    if (!(await isEmailAvailable(email))) {
      showToast("That email address is already registered", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type":"application/json"}, 
        body: JSON.stringify({username, email, password: passwordRegister})
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
    finally {
      setLoading(false)
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

      <button type="submit" disabled={loading}>Register</button>
    </form>
  );
}
