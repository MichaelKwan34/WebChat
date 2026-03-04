import express from "express";
import protect from "../middleware/authMiddleware.js"
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
router.get("/friends", protect, async(req, res) => {
  try {
    const user = await User.findOne({username: req.user.username});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ friends: user.friends.sort(), nicknames: Object.fromEntries(user.nicknames || [])});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// Fetch user's list of chats
router.get("/chats", protect, async(req, res) => {
  try {
    const user = await User.findOne({username: req.user.username});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ chats: user.chats, unreadCounts: Object.fromEntries(user.unreadCounts || []) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// Add a contact
router.post("/add-contact", protect, async (req, res) => {
  const currentUser = req.user.username; 
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
router.put("/update-chats", protect, async (req, res) => {
  const username = req.user.username;
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

// Reset the number of unread messages
router.put("/reset-unread", protect, async (req, res) => {
  const username  = req.user.username;
  const { activeChat } = req.body;
  
  await User.findOneAndUpdate({ username }, { $set: { [`unreadCounts.${activeChat}`]: 0 } });
  res.json({ success: true});
});


// Remove a user from the friend list
router.put("/remove-friend", protect, async (req, res) => {
  const username = req.user.username;
  const { activeChat } = req.body;

  if (!activeChat) {
    return res.status(400).json({ message: "activeChat is required in body" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filteredFriends = user.friends.filter(c => c !== activeChat);
    
    user.friends = filteredFriends;

    await user.save();

    res.json({ message: `'${activeChat}' has been removed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove a friend" });
  }
});

// Rename a contact
router.put("/rename", protect, async (req, res) => {
  const username = req.user.username;
  const { activeChat, nickname } = req.body;

  if (nickname == '') {
    await User.findOneAndUpdate({ username }, { $set: { [`nicknames.${activeChat}`]: "" } });
    res.json({ message: `Nickname has been reset to default`});

  } else {
    await User.findOneAndUpdate({ username }, { $set: { [`nicknames.${activeChat}`]: `${nickname}` } });
    res.json({ message: `Successfully rename '${activeChat}' as '${nickname}'!`});
  }
});

// Remove from chat list
router.put("/remove-chat", protect, async (req, res) => {
  const username = req.user.username;
  const { activeChat } = req.body;

  if (!activeChat) {
    return res.status(400).json({ message: "activeChat is required in body" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filteredChats = user.chats.filter(c => c !== activeChat);
    
    user.chats = filteredChats;

    await user.save();

    res.json({ message: `Chat history with '${activeChat}' has been deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove a chat" });
  }
});

export default router;