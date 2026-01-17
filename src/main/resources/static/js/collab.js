// Collab Space JavaScript with WebSocket Integration

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
let username = null;
let isTyping = false;
let typingTimeout = null;

// Initialize WebSocket connection
function connect() {
    const socket = new SockJS(WS_URL);
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, onConnected, onError);
}

// Callback when connected
function onConnected() {
    console.log('Connected to WebSocket');
    
    // Subscribe to chat messages
    stompClient.subscribe('/topic/public', onMessageReceived);
    
    // Subscribe to code sync
    stompClient.subscribe('/topic/code', onCodeReceived);
    
    // Send join message
    stompClient.send('/app/chat.addUser', {}, JSON.stringify({
        sender: username,
        type: 'JOIN'
    }));
    
    // Update connection status
    document.getElementById('connection-status').classList.remove('disconnected');
}

// Callback when error occurs
function onError(error) {
    console.error('WebSocket connection error:', error);
    document.getElementById('connection-status').classList.add('disconnected');
    
    // Show error in chat
    addSystemMessage('Connection lost. Please refresh the page.');
}

// Handle incoming chat messages
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    
    if (message.type === 'JOIN') {
        addSystemMessage(`${message.sender} joined the chat`);
    } else if (message.type === 'LEAVE') {
        addSystemMessage(`${message.sender} left the chat`);
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
    
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}

// Send code update
function sendCodeUpdate() {
    if (stompClient && stompClient.connected) {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        const codeMessage = {
            sender: username,
            code: code,
            language: language
        };
        
        stompClient.send('/app/code.sync', {}, JSON.stringify(codeMessage));
    }
}

// Add chat message to UI
function addChatMessage(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === username ? 'chat-message user' : 'chat-message other';
    
    messageDiv.innerHTML = `
        ${sender !== username ? `<div class="message-sender">${sender}</div>` : ''}
        <div class="message-content">${content}</div>
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

// Handle username submission
document.getElementById('username-form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    username = document.getElementById('username-input').value.trim();
    
    if (username) {
        // Hide modal and show collab space
        document.getElementById('username-modal').style.display = 'none';
        document.querySelector('.collab-container').style.display = 'grid';
        
        // Connect to WebSocket
        connect();
    }
});

// Handle message form submission
document.getElementById('message-form').addEventListener('submit', sendMessage);

// Handle code editor input with debouncing
document.getElementById('code-editor').addEventListener('input', () => {
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
});

// Handle language change
document.getElementById('language-select').addEventListener('change', () => {
    sendCodeUpdate();
});

// Handle page unload (disconnect)
window.addEventListener('beforeunload', () => {
    if (stompClient) {
        stompClient.disconnect();
    }
});
