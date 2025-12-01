const socket = io();
let currentUser = '';
let currentRoom = '';
let encryptionKey = '';

function login() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert('कृपया नाम डालें!');
        return;
    }
    
    currentUser = username;
    encryptionKey = generateEncryptionKey();
    
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('chat-screen').classList.add('active');
    document.getElementById('user-name').textContent = currentUser;
    
    socket.emit('join', currentUser);
}

function logout() {
    location.reload();
}

function generateEncryptionKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
}

function createRoom() {
    const roomId = document.getElementById('room-id').value.trim();
    if (!roomId) {
        alert('Room ID डालें!');
        return;
    }
    
    currentRoom = roomId;
    socket.emit('create-room', roomId);
    document.getElementById('room-info').textContent = `Room: ${roomId}`;
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    
    addSystemMessage(`Room "${roomId}" created! Share this ID with others.`);
}

function joinRoom() {
    const roomId = document.getElementById('room-id').value.trim();
    if (!roomId) {
        alert('Room ID डालें!');
        return;
    }
    
    currentRoom = roomId;
    socket.emit('join-room', roomId);
    document.getElementById('room-info').textContent = `Room: ${roomId}`;
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    
    addSystemMessage(`Joined room "${roomId}"`);
}

function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, encryptionKey).toString();
}

function decryptMessage(encryptedMessage) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return '[Encrypted Message - Key Required]';
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    const selfDestruct = document.getElementById('self-destruct').checked;
    
    if (!message || !currentRoom) return;
    
    const messageId = Date.now().toString();
    const encryptedMessage = encryptMessage(message);
    
    const messageData = {
        roomId: currentRoom,
        message: encryptedMessage,
        sender: currentUser,
        timestamp: new Date().toLocaleTimeString('hi-IN'),
        messageId: messageId,
        selfDestruct: selfDestruct
    };
    
    socket.emit('encrypted-message', messageData);
    
    displayMessage(message, currentUser, messageData.timestamp, messageId, true, selfDestruct);
    
    if (selfDestruct) {
        setTimeout(() => {
            deleteMessage(messageId);
            socket.emit('self-destruct', { roomId: currentRoom, messageId: messageId });
        }, 5000);
    }
    
    input.value = '';
    document.getElementById('self-destruct').checked = false;
}

function displayMessage(message, sender, timestamp, messageId, isSent, selfDestruct = false) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    messageDiv.id = `msg-${messageId}`;
    
    const senderSpan = document.createElement('div');
    senderSpan.className = 'message-sender';
    senderSpan.textContent = sender;
    
    const textSpan = document.createElement('div');
    textSpan.textContent = message;
    
    const timeSpan = document.createElement('div');
    timeSpan.className = 'message-time';
    timeSpan.textContent = timestamp;
    
    if (selfDestruct) {
        const badge = document.createElement('span');
        badge.className = 'self-destruct-badge';
        badge.textContent = '🔥 5s';
        timeSpan.appendChild(badge);
    }
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(textSpan);
    messageDiv.appendChild(timeSpan);
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function deleteMessage(messageId) {
    const messageElement = document.getElementById(`msg-${messageId}`);
    if (messageElement) {
        messageElement.style.animation = 'fadeOut 0.3s';
        setTimeout(() => messageElement.remove(), 300);
    }
}

function addSystemMessage(text) {
    const messagesDiv = document.getElementById('messages');
    const systemMsg = document.createElement('div');
    systemMsg.style.textAlign = 'center';
    systemMsg.style.color = '#666';
    systemMsg.style.fontSize = '0.9em';
    systemMsg.style.margin = '20px 0';
    systemMsg.textContent = text;
    messagesDiv.appendChild(systemMsg);
}

socket.on('encrypted-message', (data) => {
    const decryptedMessage = decryptMessage(data.message);
    displayMessage(decryptedMessage, data.sender, data.timestamp, data.messageId, false, data.selfDestruct);
    
    if (data.selfDestruct) {
        setTimeout(() => {
            deleteMessage(data.messageId);
        }, 5000);
    }
});

socket.on('delete-message', (messageId) => {
    deleteMessage(messageId);
});

socket.on('users-update', (users) => {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = users.map(u => `<p>👤 ${u.username}</p>`).join('');
});

document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.getElementById('username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

document.getElementById('room-id').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createRoom();
});
