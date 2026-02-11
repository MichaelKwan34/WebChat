import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend"

const router = express.Router();
const resend = new Resend(process.env.RESEND_API);

// Add an account to DB
router.post("/register", async (req, res) => {
    try {
        const {username, email, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({username, email, password:hashedPassword});
        await newUser.save();
        res.status(201).json({ message: "Account Created Successfully!" });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to create an account" });
    }
});

// Check username & password for login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(404).json({ match: false, message: "User not found"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {expiresIn: '1h'})
    res.json({ token })
  }
  catch (err) {
    res.status(500).json({ match: false, message: "Server error (Login)" });
  }
});

// Helper function to send OTP email
async function sendEmail(email, code) {
  const user = await User.findOne({ email });
  await resend.emails.send({
    from: "WebChat <onboarding@resend.dev>",
    to: email,
    subject: "Your OTP Code",
    html: `
      <p>Hello ${user.username},</p>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}

// Send OTP code to the specified email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = crypto.createHmac("sha256", process.env.OTP_SECRET).update(code.toString()).digest("hex");
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    user.resetCodeAttempts = 0;
    await user.save();
   
    try {
      await sendEmail(email, code);
    } catch (err) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }
  }
  
  res.status(201).json({ message: "Verification code has been sent!" });
});

// Verify OTP code
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ isMatch: false, message: "Email and OTP are required!" });
  }

  try {
    const user = await User.findOne({ email });
    
    // Expiration check
    if (!user || !user.resetCode || !user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
      if (user) {
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        user.resetCodeAttempts = undefined;
        await user.save();
      }

      return res.status(400).json({ isMatch: false, message: "Invalid or expired OTP!" });
    }

    const inputHash = crypto.createHmac("sha256", process.env.OTP_SECRET).update(otp.toString()).digest("hex");

    // if the user.resetCodeAttempts is falsy ("undefined", "null", etc) set fall back to 0
    user.resetCodeAttempts = (user.resetCodeAttempts || 0) + 1;

    // Verify OTP
    if (inputHash !== user.resetCode) {
      await user.save();

      if (user.resetCodeAttempts >= 5) {
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        user.resetCodeAttempts = undefined;
        await user.save();
      }
      return res.status(400).json({ isMatch: false, message: "Invalid or expired OTP!" });
    }

    // OTP verified successfully
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetCodeAttempts = undefined;
    await user.save();

    res.json({ 
      message: "OTP verified! You can now reset your password." ,
      isMatch: true
    });
  }
  catch (err) {
    res.status(500).json({ message: "Server error (OTP)" });
  }
});

// Change user's password
router.post("/change-password", async (req, res) => {
  try {
    const { email, password} = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } 

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.status(201).json({ message: "Password changed successfully!" });
  }
  catch (err) {
    res.status(500).json({ message: "Failed to change password"});
  }
});

export default router;