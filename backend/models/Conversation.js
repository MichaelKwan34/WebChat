import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    participants: { 
        type: [String], 
        required: true, 
        validate: [arr => arr.length >= 2, "A conversation must have at least 2 participants"]
    }
}, {timestamps: true}); 

export default mongoose.model("Conversation", ConversationSchema);