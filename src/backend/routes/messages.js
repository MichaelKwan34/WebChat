import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// Fetch the user's conversation with another user
router.get("/:conversationId", async (req, res) => {
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

// Push a message to the DB
router.post("/messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { sender, msg, receiver } = req.body;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
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
    res.status(201).json({ message: "Message successfully sent", timeSent: message.createdAt.toISOString()});
  } catch (err) {
    res.status(500).json({ message: "Failed to send the message" });
  }
});

export default router;