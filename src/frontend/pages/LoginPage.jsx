import { useState } from "react";
import LoginForm from "../components/login/LoginForm";
import RegisterForm from "../components/login/RegisterForm";
import ForgotForm from "../components/login/ForgotForm";
import OTPForm from "../components/login/OTPForm";
import ResetForm from "../components/login/ResetForm";
import "../login.css";

export default function LoginPage() {
  const [view, setView] = useState("login");

  // Props for Login Form
  const [usernameLogin, setUsernameLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  // Prop for Reset Passworf Form
  const [emailReset, setEmailReset] = useState("");
  
  return (
    <section>
      
      <div className={`login-form ${view === "login" ? "show" : "hide"}`}>
        <LoginForm setView={setView} 
          usernameLogin={usernameLogin}
          setUsernameLogin={setUsernameLogin}
          passwordLogin={passwordLogin}
          setPasswordLogin={setPasswordLogin}/>
      </div>

      <div className={`register-form ${view === "register" ? "show" : "hide"}`}>
        <RegisterForm setView={setView} 
          setUsernameLogin={setUsernameLogin} 
          setPasswordLogin={setPasswordLogin}/>
      </div>

      <div className={`forgot-form ${view === "forgot" ? "show" : "hide"}`}>
        <ForgotForm setView={setView} 
          emailReset={emailReset}
          setEmailReset={setEmailReset}/>
      </div>

      <div className={`otp-form ${view === "otp" ? "show" : "hide"}`}>
        <OTPForm setView={setView} 
          emailReset={emailReset}/>
      </div>

      <div className={`reset-form ${view === "reset" ? "show" : "hide"}`}>
        <ResetForm setView={setView} 
          emailReset={emailReset}
          setEmailReset={setEmailReset}/>
      </div>

    </section>
  );
}
