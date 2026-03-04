# 💬 WebChat (React Version)

A full-stack real-time web chat application built with React, Node.js, Express, Socket.io, MongoDB, and JWT authentication.

🌐 **Live Demo:**  
http://webchat-michaelkwan.onrender.com

---

## 📌 Overview

WebChat is a real-time messaging application that allows users to register, log in securely, and communicate instantly through WebSockets. Messages are persisted in MongoDB, and authentication is handled using JSON Web Tokens (JWT).

This project demonstrates full-stack development, authentication systems, real-time communication, and production deployment.

---

## 🚀 Features

- 🔐 User Registration & Login
- 🛡 JWT Authentication
- 💬 Real-Time Messaging with Socket.io
- 🗂 Persistent Chat History (MongoDB)
- 👥 Multiple Users Connected Simultaneously
- 🔒 JWT-based authentication for backend routes and real-time messaging
- 🌍 Deployed on Render

---

## 🛠 Tech Stack

### Frontend

- React
- Socket.io-client

### Backend

- Node.js
- Express.js
- Socket.io
- JWT (JSON Web Token)
- bcrypt (Password Hashing)
- dotenv
- cors

### Database

- MongoDB (with Mongoose)

### Deployment

- Render

---

## 🏗 System Architecture

### Authentication Flow

1. User registers or logs in.
2. Server validates credentials.
3. Server generates a JWT token.
4. Token is stored on the client.
5. Protected routes verify the token before granting access.

### Real-Time Messaging Flow

1. After authentication, the client establishes a Socket.io connection.
2. When a user sends a message:
   - It is emitted through Socket.io.
   - The server broadcasts it to connected users.
   - The message is saved in MongoDB.
3. When users connect, previous messages can be retrieved from the database.

---

## ⚙️ Local Development Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/michaelkwan34/webchat.git
cd webchat
```

### 2️⃣ Create `.env` file inside the root directory

```env
MONGO_URI=mongo_uri_string
OTP_SECRET=otp_secret_key
JWT_SECRET=JWT_secret_key
RESEND_API=api_secret_key
```

### 3️⃣ Start the project

```bash
npm install
npm run dev
```

To expose the Vite dev server on your local network:

```bash
npm run dev -- --host
```

---

### 🔐 Security Considerations

- Passwords are hashed using bcrypt.
- JWT is used for stateless authentication.
- Protected API routes require token verification.
- Environment variables are used to protect sensitive credentials.

---

### 📈 Future Improvements

- Add message reply functionality
- Implement user blocking feature
- Support image/photo uploads
- Add email verification during registration

---

## 👤 Author

Michael Kwan
