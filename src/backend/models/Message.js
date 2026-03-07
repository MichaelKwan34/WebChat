import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {type: String, required: true},
    text: {type: String, required: true},
    deleteBy: {type: [String], default: []},
    replyTo: {
        type: {
            sender: { type: String },
            text: { type: String }
        },
        default: null
    }
}, {timestamps: true}); 

export default mongoose.model("Message", MessageSchema);