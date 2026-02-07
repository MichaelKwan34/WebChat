import path from "path";
import express from "express";
import connectDB from "./db.js";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken"
import http from "http";
import { Server } from "socket.io"
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import conversationRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();
await connectDB();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// ---------- Serve frontend ----------
app.use(express.static(path.join(process.cwd(), "dist")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist/index.html"));
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] }});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("authenticate", (token) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.username = payload.username;
      onlineUsers.set(socket.username, socket.id);
    } catch (err) {
      socket.disconnect();
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
    }
  });

  socket.on("private_message", ({ from, to, text, time }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("private_message", { from, to, text, time })
    }
  });
});

httpServer.listen(PORT, () => { console.log(`Server running on port ${PORT}...`); });