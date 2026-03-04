# 💬 WebChat

A full-stack real-time web chat application built with React, Node.js, Express, Socket.io, MongoDB, and JWT authentication.

🌐 **Live Demo:**  
https://webchat-michaelkwan.onrender.com

---

## 📌 Overview

WebChat is a real-time messaging application that allows users to register, log in securely, and communicate instantly through WebSockets. Messages are persisted in MongoDB, and authentication is handled using JSON Web Tokens (JWT).

This project demonstrates full-stack development, secure authentication, real-time communication, and production deployment with a persistent database.

---

## 🚀 Features

- 🛡 Stateless JWT Authentication
- 🔒 Protected Backend API Endpoints
- 💬 Real-Time Messaging via WebSockets (Socket.io)
- 🗂 Persistent Chat History (MongoDB)
- 👥 Multi-User Concurrent Support
- 🔐 Secure User Registration & Login
- 🌍 Production Deployment on Render

---

## 🛠 Tech Stack

### Frontend

- React (with Vite)
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
4. Token is stored on the client (currently localStorage/sessionStorage; can be upgraded to HTTP-only cookies).
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

### 3️⃣ Start the Backend

```bash
node src/backend/server.js
```

### 4️⃣ Start the Frontend

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
- Future improvements include storing JWT in HTTP-only cookies to mitigate XSS attacks.

---

### 📈 Future Improvements

- Add threaded message replies (in progress)
- Show real-time typing indicators
- Upgrade authentication to HTTP-only cookies for enhanced security
- Consider using Redux for global state management in future iterations

---

### 💡 Nice-to-Have Enhancements

- End-to-end message encryption
- Message editing/deletion
- User profile management (username/password/bio)
- User blocking functionality
- Image/photo uploads

---

## 👤 Author

Michael Kwan
