import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {type: String, required: true},
    text: {type: String, required: true},
    deleteBy: {type: [String], default: []}
}, {timestamps: true}); 

export default mongoose.model("Message", MessageSchema);