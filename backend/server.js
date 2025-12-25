import express from "express";
import connectDB from "./db.js";
import User from "./models/User.js"
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

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

        res.status(201).json({ message: "Account Created", user: newUser});
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


app.listen(3000, () => { console.log("Server running on port 3000"); });
