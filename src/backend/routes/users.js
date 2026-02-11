import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Check if username is taken or not
router.get("/check-username", async (req, res) => {
  const { username } = req.query;
  const exists = await User.exists({ username });
  res.json({ available: !exists });
});

// Check if email is taken or not
router.get("/check-email", async (req, res) => {
  const { email } = req.query;
  const exists = await User.exists({ email });
  res.json({ available: !exists });
});

// Fetch user's friends list
router.get("/:username/friends", async(req, res) => {
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
router.get("/:username/chats", async(req, res) => {
  try {
    const user = await User.findOne({username: req.params.username});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ chats: user.chats });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// Add a contact
router.post("/add-contact/:currentUser", async (req, res) => {
  const { currentUser} = req.params; 
  const { searchedUsername } = req.body;
  try {
    const user = await User.findOne({ username: currentUser });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found"});
    } 

    user.friends.push(searchedUsername);
    await user.save();
    res.json({ message: "Successfully added a contact", success: true })
  } catch (err) {
    res.status(500).json({ message: "Failed to add a contact" });
  }
});

// Find a user
router.get("/find-user/:currentUser/:username", async (req, res) => {
  const { currentUser, username } = req.params;
  const currUser = await User.findOne({ username: currentUser });
  const exists = await User.exists({ username });
  res.json({ exists: exists, user: currUser, searchedUser: username});
});

// Update the order of chats for a user
router.put("/:username/update-chats", async (req, res) => {
  const { username } = req.params;
  const { activeChat } = req.body;

  if (!activeChat) {
    return res.status(400).json({ message: "activeChat is required in body" });
  }

  try {
    const user = await User.findOne({ username });
    const anotherUser = await User.findOne({ username: activeChat })

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!anotherUser) {
      return res.status(404).json({ message: "The other user is not found" });
    }

    const filteredChatsUser = user.chats.filter(c => c !== activeChat);
    const filteredChatsAnotherUser = anotherUser.chats.filter(c => c !== username);
    
    user.chats = [activeChat, ...filteredChatsUser];
    anotherUser.chats = [username, ...filteredChatsAnotherUser];

    await user.save();
    await anotherUser.save();

    res.json({ message: "Chats updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update chats" });
  }
});

export default router;