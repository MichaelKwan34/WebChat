import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// Fetch the conversationId between users
router.get("/:user1/:user2", async (req, res) => {
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

export default router;
