# 🔒 Secure Messenger

Privacy-focused end-to-end encrypted messaging app

## Features

✅ **End-to-End Encryption** - Messages encrypted on your device using AES-256
✅ **Anonymous Login** - No phone number or email required
✅ **Self-Destructing Messages** - Messages auto-delete after 5 seconds
✅ **No Server Storage** - Messages never stored on server
✅ **Real-time Chat** - Instant messaging with Socket.io
✅ **Room-based** - Create private rooms and share IDs
✅ **Privacy First** - No tracking, no data collection

## How to Use

1. Enter any username (anonymous)
2. Create a room or join existing room with Room ID
3. Share Room ID with others to chat
4. Enable self-destruct for sensitive messages
5. All messages are encrypted end-to-end

## Tech Stack

- Node.js + Express
- Socket.io for real-time communication
- CryptoJS for AES-256 encryption
- Pure HTML/CSS/JS frontend

## Privacy Guarantee

- Messages encrypted on client-side before sending
- Server only relays encrypted data
- No message storage or logging
- No user data collection
- Anonymous usage

## Installation

```bash
npm install
npm start
```

Visit http://localhost:3000

## Deploy

Can be deployed on Railway, Vercel, Heroku, or any Node.js hosting platform.

---

Made with 🔒 for Privacy
