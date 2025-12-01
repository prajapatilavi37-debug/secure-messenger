const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

const activeUsers = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    activeUsers.set(socket.id, { username, socketId: socket.id });
    io.emit('users-update', Array.from(activeUsers.values()));
  });

  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
  });

  socket.on('encrypted-message', (data) => {
    socket.to(data.roomId).emit('encrypted-message', {
      message: data.message,
      sender: data.sender,
      timestamp: data.timestamp,
      messageId: data.messageId
    });
  });

  socket.on('self-destruct', (data) => {
    io.to(data.roomId).emit('delete-message', data.messageId);
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    rooms.forEach((users, roomId) => {
      users.delete(socket.id);
      if (users.size === 0) {
        rooms.delete(roomId);
      }
    });
    io.emit('users-update', Array.from(activeUsers.values()));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🔒 Secure Messenger running on port ${PORT}`);
});
