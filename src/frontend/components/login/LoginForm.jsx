import { useState } from "react";
import { showToast } from "../../utils/toast.js";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ setView, usernameLogin, setUsernameLogin, passwordLogin, setPasswordLogin }) {
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameLogin, password: passwordLogin })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard", { replace:true });
        showToast("Login Successfull", "success");
      } else {
        showToast("Username or password is incorrect", "error");
      }
    } catch (err) {
      showToast("Server error (Login)", "error");
    }
  };
  
  return (
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        <div className="inputbox">
          <ion-icon name="person-outline"></ion-icon>
          <input type="text" autoComplete="off" required value={usernameLogin} onChange={(e) => setUsernameLogin(e.target.value)}/>
          <label>Username</label>
        </div>

        <div className="inputbox">
          <ion-icon name="lock-closed-outline"></ion-icon>
          <input type="password" autoComplete="off" required value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)}/>
          <label>Password</label>
        </div>

        <div className="forgot">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <label> 
            <a href="#" onClick={(e) => { e.preventDefault(); setView("forgot"); }}> Forgot password?</a>
          </label>
        </div>

        <button type="submit">Login</button>

        <div className="register">
          <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView("register"); }}>Register </a> </p>
        </div>
      </form>
  );
}
