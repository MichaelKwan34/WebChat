import express from "express";
import protect from "../middleware/authMiddleware.js"
import mongoose from "mongoose";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js"
import User from "../models/User.js";

const router = express.Router();

// Fetch the user's conversation with another user
router.get("/:conversationId", protect, async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.username)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Push a message to the DB
router.post("/:conversationId", protect, async (req, res) => {
  const sender = req.user.username;
  const { conversationId } = req.params;
  const { msg, receiver } = req.body;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(sender)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userA = await User.findOne({ username: sender });
    const userB = await User.findOne({ username: receiver });
    const message = new Message({ conversationId, sender, text: msg })

    if (!userA.chats.includes(receiver)) {
      userA.chats.push(receiver);
      await userA.save();
    }
    if (!userB.chats.includes(sender)) {
      userB.chats.push(sender);
      await userB.save();
    }

    await message.save();
    await User.findOneAndUpdate({ username: receiver }, { $inc: { [`unreadCounts.${sender}`]: 1 } });
    res.status(201).json({ message: "Message successfully sent", timeSent: message.createdAt.toISOString()});
  } catch (err) {
    res.status(500).json({ message: "Failed to send the message" });
  }
});

// Perform physical or logical deletion of messages
router.post("/:conversationId/delete-chat", protect, async (req, res) => {
  const { conversationId } = req.params;
  const { activeChat } = req.body;
  const currentUser = req.user.username;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  try {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    const unmarkedMessages = messages.filter(msg => !msg.deleteBy.includes(currentUser));

    for (const msg of unmarkedMessages) {
      if (!msg.deleteBy.includes(currentUser)) {
        msg.deleteBy.push(currentUser);
      }
      
      if (msg.deleteBy.includes(currentUser) && msg.deleteBy.includes(activeChat)) {
        await msg.deleteOne();
      } else {
        await msg.save();
      }
    }
    res.status(201).json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Message deletion failed" });
  }
});

export default router;