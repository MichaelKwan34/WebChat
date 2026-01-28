import express from "express";
import connectDB from "./db.js";
import User from "./models/User.js"
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
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

        res.status(201).json({ message: "Account Created Successfully!", user: newUser});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create an account"});
    }
});

// Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get users" });
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
    res.json({ match: isMatch });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ match: false, message: "Server error" });
  }
});

// Send OTP code
const mailerSend = new MailerSend({
   apiKey: process.env.MAILERSEND_TOKEN,
});

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
    } catch (error) {
      console.error("Failed to send email:", error);
    }
}

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = code; // hash later
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();
   
    try {
      await sendEmail(email, code);
    } catch (err) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }
  }
  
  res.json({
    message: "Verification code has been sent!"
  });
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ isMatch: false, message: "Email and OTP are required!" });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user || !user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ isMatch: false, message: "Invalid or expired OTP!" });
    }

    // compare the hash code later
    if (otp !== user.resetCode || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ isMatch: false, message: "Invalid or expired OTP!" });
    }

    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();
    res.json({ 
      message: "OTP verified! You can now reset your password." ,
      isMatch: true
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/change-password", async (req, res) => {
  try {
    const { email, password} = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    } 

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.status(201).json({ message: "Password changed successfully!" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password"});
  }
 
});

app.listen(3000, () => { console.log("Server running on port 3000..."); });
