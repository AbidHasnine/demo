// Collab Space JavaScript with WebSocket Integration and Room Support

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
let username = null;
let roomId = null;
let roomPassword = null;
let roomName = null;
let isTyping = false;
let typingTimeout = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and pre-fill username
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.displayName) {
        document.getElementById('creator-username').value = user.displayName;
        document.getElementById('join-username').value = user.displayName;
    }
    
    // Tab switching for room modal
    const tabBtns = document.querySelectorAll('.room-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchRoomTab(btn.dataset.tab));
    });
    
    // Form submissions
    document.getElementById('create-room-form').addEventListener('submit', handleCreateRoom);
    document.getElementById('join-room-form').addEventListener('submit', handleJoinRoom);
    document.getElementById('message-form').addEventListener('submit', sendMessage);
    
    // Leave room button
    document.getElementById('leave-room-btn').addEventListener('click', handleLeaveRoom);
    
    // Code editor input with debouncing
    document.getElementById('code-editor').addEventListener('input', handleCodeInput);
    
    // Language change
    document.getElementById('language-select').addEventListener('change', () => {
        sendCodeUpdate();
    });
});

// Switch between Create and Join tabs
function switchRoomTab(tab) {
    document.querySelectorAll('.room-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.querySelectorAll('.room-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.getElementById(`${tab}-room-form`).classList.add('active');
    clearErrors();
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add('show');
}

// Create Room Handler
async function handleCreateRoom(e) {
    e.preventDefault();
    clearErrors();
    
    const creatorUsername = document.getElementById('creator-username').value.trim();
    const name = document.getElementById('room-name').value.trim();
    const password = document.getElementById('room-password').value;
    
    if (!creatorUsername || !name || !password) {
        showError('create-error', 'Please fill in all fields');
        return;
    }
    
    if (password.length < 4) {
        showError('create-error', 'Password must be at least 4 characters');
        return;
    }
    
    try {
        const response = await fetch('/api/rooms/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: password,
                creatorUsername: creatorUsername
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store room info
            username = creatorUsername;
            roomId = data.roomId;
            roomPassword = data.password;
            roomName = data.name;
            
            // Show room created modal with credentials
            document.getElementById('created-room-id').textContent = data.roomId;
            document.getElementById('created-room-password').textContent = data.password;
            document.getElementById('room-modal').style.display = 'none';
            document.getElementById('room-created-modal').style.display = 'flex';
        } else {
            showError('create-error', data.message || 'Failed to create room');
        }
    } catch (error) {
        console.error('Create room error:', error);
        showError('create-error', 'Connection error. Please try again.');
    }
}

// Join Room Handler
async function handleJoinRoom(e) {
    e.preventDefault();
    clearErrors();
    
    const joinUsername = document.getElementById('join-username').value.trim();
    const joinRoomId = document.getElementById('join-room-id').value.trim().toUpperCase();
    const joinPassword = document.getElementById('join-password').value;
    
    if (!joinUsername || !joinRoomId || !joinPassword) {
        showError('join-error', 'Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch('/api/rooms/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomId: joinRoomId,
                password: joinPassword,
                username: joinUsername
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store room info
            username = joinUsername;
            roomId = data.roomId;
            roomName = data.name;
            
            // Load existing code if any
            if (data.currentCode) {
                document.getElementById('code-editor').value = data.currentCode;
            }
            if (data.currentLanguage) {
                document.getElementById('language-select').value = data.currentLanguage;
            }
            
            // Update active users count
            updateActiveUsers(data.activeUsers);
            
            // Enter the room
            document.getElementById('room-modal').style.display = 'none';
            showCollabSpace();
            connect();
        } else {
            showError('join-error', data.message || 'Failed to join room');
        }
    } catch (error) {
        console.error('Join room error:', error);
        showError('join-error', 'Connection error. Please try again.');
    }
}

// Enter room after creation
function enterRoom() {
    document.getElementById('room-created-modal').style.display = 'none';
    showCollabSpace();
    connect();
}

// Show collab space
function showCollabSpace() {
    document.getElementById('current-room-id').textContent = roomId;
    document.getElementById('current-room-name').textContent = roomName;
    document.querySelector('.collab-container').style.display = 'grid';
}

// Update active users count
function updateActiveUsers(users) {
    if (users && users.length) {
        document.getElementById('active-users-count').textContent = users.length;
    }
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Leave Room Handler
async function handleLeaveRoom() {
    if (stompClient && stompClient.connected) {
        // Send leave message
        stompClient.send(`/app/chat.leaveRoom/${roomId}`, {}, JSON.stringify({
            sender: username,
            type: 'LEAVE',
            roomId: roomId
        }));
        
        // Notify server via REST
        try {
            await fetch(`/api/rooms/leave?roomId=${roomId}&username=${username}`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Leave room error:', error);
        }
        
        // Disconnect WebSocket
        stompClient.disconnect();
    }
    
    // Reset state
    roomId = null;
    roomName = null;
    username = null;
    
    // Clear UI
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('code-editor').value = '';
    
    // Show room modal
    document.querySelector('.collab-container').style.display = 'none';
    document.getElementById('room-modal').style.display = 'flex';
}

// Initialize WebSocket connection
function connect() {
    const socket = new SockJS(WS_URL);
    stompClient = Stomp.over(socket);
    
    // Disable debug logging
    stompClient.debug = null;
    
    stompClient.connect({}, onConnected, onError);
}

// Callback when connected
function onConnected() {
    console.log('Connected to WebSocket');
    
    // Subscribe to room-specific chat messages
    stompClient.subscribe(`/topic/room/${roomId}/chat`, onMessageReceived);
    
    // Subscribe to room-specific code sync
    stompClient.subscribe(`/topic/room/${roomId}/code`, onCodeReceived);
    
    // Send join message
    stompClient.send(`/app/chat.addUser/${roomId}`, {}, JSON.stringify({
        sender: username,
        type: 'JOIN',
        roomId: roomId
    }));
    
    // Update connection status
    document.getElementById('connection-status').classList.remove('disconnected');
    document.getElementById('connection-status').classList.add('connected');
}

// Callback when error occurs
function onError(error) {
    console.error('WebSocket connection error:', error);
    document.getElementById('connection-status').classList.add('disconnected');
    document.getElementById('connection-status').classList.remove('connected');
    
    // Show error in chat
    addSystemMessage('Connection lost. Please refresh the page.');
}

// Handle incoming chat messages
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    
    if (message.type === 'JOIN') {
        addSystemMessage(`${message.sender} joined the room`);
        // Increment user count
        const countEl = document.getElementById('active-users-count');
        countEl.textContent = parseInt(countEl.textContent) + 1;
    } else if (message.type === 'LEAVE') {
        addSystemMessage(`${message.sender} left the room`);
        // Decrement user count
        const countEl = document.getElementById('active-users-count');
        const currentCount = parseInt(countEl.textContent);
        if (currentCount > 0) {
            countEl.textContent = currentCount - 1;
        }
    } else if (message.type === 'CHAT') {
        addChatMessage(message.sender, message.content);
    }
}

// Handle incoming code updates
function onCodeReceived(payload) {
    const codeMessage = JSON.parse(payload.body);
    
    // Don't update if the sender is the current user (to avoid overwriting their own changes)
    if (codeMessage.sender !== username && !isTyping) {
        const codeEditor = document.getElementById('code-editor');
        const cursorPosition = codeEditor.selectionStart;
        codeEditor.value = codeMessage.code;
        
        // Restore cursor position (approximately)
        codeEditor.setSelectionRange(cursorPosition, cursorPosition);
        
        // Update language if changed
        document.getElementById('language-select').value = codeMessage.language;
        
        // Show who's typing
        document.getElementById('editor-user').textContent = `Last edited by: ${codeMessage.sender}`;
    }
}

// Send chat message
function sendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const messageContent = messageInput.value.trim();
    
    if (messageContent && stompClient && stompClient.connected) {
        const chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT',
            roomId: roomId
        };
        
        stompClient.send(`/app/chat.sendMessage/${roomId}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}

// Send code update
function sendCodeUpdate() {
    if (stompClient && stompClient.connected && roomId) {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        const codeMessage = {
            sender: username,
            code: code,
            language: language,
            roomId: roomId
        };
        
        stompClient.send(`/app/code.sync/${roomId}`, {}, JSON.stringify(codeMessage));
    }
}

// Handle code editor input with debouncing
function handleCodeInput() {
    isTyping = true;
    
    // Clear existing timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // Set new timeout to send code update after user stops typing
    typingTimeout = setTimeout(() => {
        isTyping = false;
        sendCodeUpdate();
    }, 500); // Wait 500ms after user stops typing
}

// Add chat message to UI
function addChatMessage(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === username ? 'chat-message user' : 'chat-message other';
    
    messageDiv.innerHTML = `
        ${sender !== username ? `<div class="message-sender">${sender}</div>` : ''}
        <div class="message-content">${escapeHtml(content)}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add system message to UI
function addSystemMessage(content) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message system';
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle page unload (disconnect)
window.addEventListener('beforeunload', () => {
    if (stompClient && stompClient.connected && roomId) {
        // Send leave message
        stompClient.send(`/app/chat.leaveRoom/${roomId}`, {}, JSON.stringify({
            sender: username,
            type: 'LEAVE',
            roomId: roomId
        }));
        stompClient.disconnect();
    }
});
