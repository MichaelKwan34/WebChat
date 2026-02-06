import { useRef } from "react";
import { showToast } from "../../utils/toast.js";

export default function OTPForm({ setView, emailReset}) {
  const otp1 = useRef(null);
  const otp2 = useRef(null);
  const otp3 = useRef(null);
  const otp4 = useRef(null);
  const otp5 = useRef(null);
  const otp6 = useRef(null);

  function resetOtpInput() {
    otp1.current.value = "";
    otp2.current.value = ""
    otp3.current.value = ""
    otp4.current.value = ""
    otp5.current.value = ""
    otp6.current.value = ""
  }

  const handleInput = (e, nextRef) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = val;
    if (val && nextRef) nextRef.current.focus();
  }

  const handleKeyDown = (e, prevRef) => {
    if (e.key === "Backspace" && !e.target.value && prevRef) prevRef.current.focus();
  };

  async function verifyOTP(email, otp) {
    const res = await fetch("http://localhost:3000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email:email, otp:otp })
    });

    if (!res.ok) {
      throw new Error(res.message || "OTP verification failed. Please try again.");
    }
    return res.json();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpRefs = [otp1, otp2, otp3, otp4, otp5, otp6];
    const otp = otpRefs.map(ref => ref.current.value).join("");

    try {
      const res = await verifyOTP(emailReset, otp);

      if (res.isMatch === true) {
        showToast(res.message, "success");
        setView("reset")
        resetOtpInput();
      } 
    } catch (err) {
      showToast("Invalid or expired OTP. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="otp-header">
        <ion-icon name="arrow-back" id="otpBackIcon" onClick={() => {setView("forgot"); resetOtpInput()}}></ion-icon>
        <h1>Verify Your Email</h1>
      </div>

      <div className="otpInputs">
        <input type="tel" maxLength="1" inputMode="numeric" className="otp-box" autoComplete="off" ref={otp1} 
          onInput={(e) => handleInput(e, otp2)}
          onKeyDown={(e) => handleKeyDown(e, null)} required/>

        <input type="tel" maxLength="1" inputMode="numeric" className="otp-box" autoComplete="off" ref={otp2} 
          onInput={(e) => handleInput(e, otp3)}
          onKeyDown={(e) => handleKeyDown(e, otp1)} required/>

        <input type="tel" maxLength="1" inputMode="numeric" className="otp-box" autoComplete="off" ref={otp3} 
          onInput={(e) => handleInput(e, otp4)}
          onKeyDown={(e) => handleKeyDown(e, otp2)} required/>

        <input type="tel" maxLength="1" inputMode="numeric" className="otp-box" autoComplete="off" ref={otp4} 
          onInput={(e) => handleInput(e, otp5)}
          onKeyDown={(e) => handleKeyDown(e, otp3)} required/>

        <input type="tel" maxLength="1" inputMode="numeric" className="otp-box" autoComplete="off" ref={otp5} 
          onInput={(e) => handleInput(e, otp6)}
          onKeyDown={(e) => handleKeyDown(e, otp4)} required/>

        <input type="tel" maxLength="1" inputMode="numeric" className="otp-box" autoComplete="off" ref={otp6} 
          onInput={(e) => handleInput(e, null)}
          onKeyDown={(e) => handleKeyDown(e, otp5)} required/>

      </div>
      <button type="submit">Continue</button>
    </form>
  );
}