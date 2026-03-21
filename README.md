# 🎥 WebRTC Video Calling App

A real-time video calling application built using WebRTC with a custom WebSocket signaling server. Users can create or join rooms, get host approval, and communicate via peer-to-peer connections with support for screen sharing.

---

## 🚀 Features

* 🔐 Room-based video calling
* 👤 Host approval system for joining users
* 📡 WebRTC peer-to-peer communication (mesh topology)
* 🎥 Audio & video streaming
* 🖥️ Screen sharing (replaceTrack implementation)
* ⚡ Real-time signaling using WebSockets
* 🔄 Dynamic user join/leave handling

---

## 🧠 Tech Stack

### Frontend

* React (TypeScript)
* WebRTC APIs
* Vite

### Backend

* Node.js (TypeScript)
* WebSocket (ws)

---

## ⚙️ How It Works

1. User creates a room (host)
2. Other users request to join
3. Host approves/rejects requests
4. Once approved:
   * WebRTC connections are established
   * SDP (offer/answer) exchange happens
   * ICE candidates are exchanged
5. Media streams are shared directly (peer-to-peer)

---

## 🛠️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/JyotirGarhia/WebRTC-app.git
cd WebRTC-app
```

---

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

```
PORT=3001
```

### Frontend (`frontend/.env`)

```
VITE_WS_URL=ws://localhost:3001
```

---

## ⚠️ Limitations (Current)

* Mesh topology (performance drops with many users)
* No TURN server (may fail under strict NAT)
* No reconnection handling yet

---

## 🔮 Future Improvements

* Add STUN servers for NAT traversal
* Move to SFU architecture for scalability
* Improve UI/UX
* Add chat functionality
* Handle reconnections & network failures

---

## 📌 Project Status

✅ Core WebRTC signaling implemented
✅ Screen sharing working
🔜 NAT traversal (TURN)
🔜 Deployment

---

## 👨‍💻 Author
Jyotir Garhia

Built as a hands-on project to understand WebRTC, real-time communication, and system design.
