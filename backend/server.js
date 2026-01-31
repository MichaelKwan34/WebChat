import express from "express";
import connectDB from "./db.js";
import mongoose from "mongoose";
import User from "./models/User.js"
import Message from "./models/Message.js"
import Conversation from "./models/Conversation.js"
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
await connectDB();

// Add an account to DB
app.post("/register", async (req, res) => {
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

// Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to get users" });
    }
});

// Check if username is taken or not
app.get("/users/check-username", async (req, res) => {
  const { username } = req.query;
  const exists = await User.exists({ username });
  res.json({ available: !exists });
});

// Check if email is taken or not
app.get("/users/check-email", async (req, res) => {
  const { email } = req.query;
  const exists = await User.exists({ email });
  res.json({ available: !exists });
});

// Check username & password for login
app.post("/login", async (req, res) => {
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

// Send OTP code via MailerSend API
const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_TOKEN });

async function sendEmail(email, code) {
  const user = await User.findOne({ email });
  const sentFrom = new Sender("no-reply@test-nrw7gymnxkog2k8e.mlsender.net", "WebChat");
  const recipients = [new Recipient(email, user.username)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Your OTP Code")
    .setHtml(`
      <p>Your verification code is:</p>
      <h1>${code}</h1>
      <p>This code will expire in 10 minutes.</p>
    `)
    .setText(`Your OTP code is ${code}. It will expire in 10 minutes.`);

    try {
      await mailerSend.email.send(emailParams);
    } catch (err) {
      return res.status(500).json({ message: "Failed to send email" });
    }
}

// Send OTP code to the specified email
app.post("/forgot-password", async (req, res) => {
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
  
  res.json({ message: "Verification code has been sent!" });
});

// Verify OTP code
app.post("/verify-otp", async (req, res) => {
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

    user.resetCodeAttempts = (user.resetCodeAttempts || 0) + 1; // if the user.resetCodeAttempts is falsy ("undefined", "null", etc) set fall back to 0

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
app.post("/change-password", async (req, res) => {
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

// Fetch user's friends list
app.get("/users/:username/friends", async(req, res) => {
  try {
    const user = await User.findOne({username: req.params.username});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ friends: user.friends.sort() });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// Fetch user's list of chats
app.get("/users/:username/chats", async(req, res) => {
  try {
    const user = await User.findOne({username: req.params.username});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ friends: user.chats });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// Fetch the conversationId between users
app.get("/conversations/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    let conversation = await Conversation.findOne({ participants: { $all: [user1, user2] }});

    if (!conversation) {
      conversation = new Conversation ( { participants: [user1, user2] });
      await conversation.save();
    }
    res.json({ conversationId: conversation._id });
  } catch (err) {
    res.status(500).json({ message: "Server error (Conversation)" });
  }
});

// Fetch the user's conversation with another user
app.get("/messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  try {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

app.listen(3000, () => { console.log("Server running on port 3000..."); });
