// Collab Space JavaScript with WebSocket Integration and Room Support

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
let username = null;
let roomId = null;
let sessionId = null;
let terminalBuffer = "";

// CodeMirror related globals
let editor = null;
let isRemoteUpdate = false; // Flag to prevent echo when receiving remote updates 

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get from URL parameters ONLY - don't use sessionStorage at all
    // because sessionStorage is shared across tabs and causes contamination
    roomId = urlParams.get('roomId');
    username = urlParams.get('username');
    
    // Decode username in case it has spaces
    if (username) {
        username = decodeURIComponent(username);
    }

    if (!roomId || !username) {
        alert('Room ID and username are required.');
        window.location.href = 'index.html';
        return;
    }

    editor = CodeMirror(document.getElementById('code-editor-container'), {
        mode: 'text/x-c++src',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
    });

    // Add code editor change listener for real-time sync
    editor.on('change', function(instance, changeObj) {
        // Only broadcast changes made by the local user, not remote updates
        if (!isRemoteUpdate && stompClient && stompClient.connected) {
            const codeSyncMessage = {
                sender: username,
                code: instance.getValue(),
                language: 'cpp',
                roomId: roomId,
                type: 'UPDATE'
            };
            stompClient.send('/app/code.sync', {}, JSON.stringify(codeSyncMessage));
        }
    });

    connect();
    
    document.getElementById('run-code-btn').addEventListener('click', handleRunCode);
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    document.getElementById('clear-terminal-btn').addEventListener('click', clearTerminal);
    document.getElementById('terminal-input').addEventListener('keypress', handleTerminalKeypress);
    document.getElementById('submit-input-btn').addEventListener('click', submitTerminalInput);

    document.getElementById('current-room-id').textContent = roomId;
    
    // Add message form listener for chat
    document.getElementById('message-form').addEventListener('submit', sendMessage);
    
    // Add leave room button listener
    document.getElementById('leave-room-btn').addEventListener('click', leaveRoom);
    
    // Fetch initial room data and user count
    // Note: Users are already added to the room via create/join API calls
    fetchRoomUserCount();
    
    // Fetch and display room name, etc.
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    if (tabId === 'code-tab' && editor) {
        setTimeout(() => editor.refresh(), 10);
    }
}

function addTerminalText(text, type = 'output') {
    const terminalContent = document.getElementById('terminal-content');
    const lastLine = terminalContent.lastElementChild;

    // If the last element is a line of the same type, append to it.
    // This is to prevent creating a new line for each character.
    if (lastLine && lastLine.className === `terminal-line ${type}`) {
        lastLine.textContent += text;
    } else {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        terminalContent.appendChild(line);
    }
    scrollTerminalToBottom();
}


function scrollTerminalToBottom() {
    const terminalBody = document.getElementById('terminal-body');
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function clearTerminal() {
    document.getElementById('terminal-content').innerHTML = `
        <div class="terminal-line welcome">$ CodeCollab Terminal Ready</div>
        <div class="terminal-line info">Click "Run Code" to execute your program...</div>
    `;
    hideTerminalInput();
}

function showTerminalInput(prompt = '> ') {
    const inputLine = document.getElementById('terminal-input-line');
    const inputField = document.getElementById('terminal-input');
    const promptSpan = inputLine.querySelector('.terminal-prompt');
    
    promptSpan.textContent = prompt;
    inputLine.style.display = 'flex';
    inputField.value = '';
    inputField.focus();
}

function hideTerminalInput() {
    document.getElementById('terminal-input-line').style.display = 'none';
}

function handleTerminalKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitTerminalInput();
    }
}

function submitTerminalInput() {
    const inputField = document.getElementById('terminal-input');
    const userInput = inputField.value;
    
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/compiler/input', {}, userInput);
    }
    
    addTerminalText(userInput + '\n', 'user-input');
    inputField.value = '';
    terminalBuffer = ''; 
    hideTerminalInput();
}

function handleRunCode() {
    const code = editor.getValue();
    if (!code || !code.trim()) {
        addTerminalText('Error: Please enter some code to run.\n', 'error');
        switchTab('terminal-tab');
        return;
    }

    clearTerminal();
    addTerminalText('$ Running program...\n', 'info');

    if (stompClient && stompClient.connected) {
        const request = {
            code: code,
            language: 'cpp'
        };
        stompClient.send('/app/compiler/execute', {}, JSON.stringify(request));
    } else {
        addTerminalText('Error: Not connected to the server.\n', 'error');
    }
}

function connect() {
    const socket = new SockJS(WS_URL);
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    console.log('Connected to WebSocket');
    var transport = stompClient.ws._transport;
    var a = transport.url.split('/');
    sessionId = a[a.length - 2];

    console.log('Session ID:', sessionId);
    console.log('Room ID:', roomId);
    console.log('Username:', username);

    // Subscribe to personal compiler output
    stompClient.subscribe('/user/' + sessionId + '/topic/compiler/output', onCompilerOutputReceived);
    console.log('Subscribed to compiler output');
    
    // Subscribe to room-specific chat messages
    stompClient.subscribe('/topic/room/' + roomId, onChatMessageReceived);
    console.log('Subscribed to room chat:', '/topic/room/' + roomId);
    
    // Subscribe to public chat for JOIN/LEAVE notifications
    stompClient.subscribe('/topic/public', onChatMessageReceived);
    console.log('Subscribed to public chat');
    
    // Subscribe to room-specific code sync
    stompClient.subscribe('/topic/code/' + roomId, onCodeSyncReceived);
    console.log('Subscribed to code sync:', '/topic/code/' + roomId);
    
    document.getElementById('connection-status').classList.add('connected');
    
    // Notify the room that this user has joined
    const joinMessage = {
        sender: username,
        content: username + ' joined the room',
        type: 'JOIN',
        roomId: roomId
    };
    console.log('Sending join message:', joinMessage);
    stompClient.send('/app/chat.addRoomUser', {}, JSON.stringify(joinMessage));
}

function onCompilerOutputReceived(payload) {
    const response = JSON.parse(payload.body);
    const output = response.output; 

    addTerminalText(output, response.error ? 'error' : 'output');
    terminalBuffer += output;

    const trimmedBuffer = terminalBuffer.trim();
    if (trimmedBuffer.length > 0 && trimmedBuffer.endsWith(':')) {
        showTerminalInput();
    }
}

function onError(error) {
    console.error('WebSocket connection error:', error);
    addTerminalText('Connection lost. Please refresh the page.\n', 'error');
    document.getElementById('connection-status').classList.remove('connected');
}

function sendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        return;
    }
    
    console.log('Send message clicked:', messageText);
    console.log('STOMP connected?', stompClient && stompClient.connected);
    
    if (stompClient && stompClient.connected) {
        const chatMessage = {
            sender: username,
            content: messageText,
            type: 'CHAT',
            roomId: roomId
        };
        
        console.log('Sending chat message:', chatMessage);
        // Send to room-specific topic
        stompClient.send('/app/chat.sendRoomMessage', {}, JSON.stringify(chatMessage));
        
        // Also display the message locally for the sender
        addChatMessage(username, messageText, 'user');
        messageInput.value = '';
    } else {
        console.error('WebSocket not connected');
        console.log('STOMP client state:', stompClient);
        addChatMessage('System', 'Not connected to the server', 'system');
    }
}

function onChatMessageReceived(payload) {
    try {
        const message = JSON.parse(payload.body);
        console.log('Chat message received:', message);
        console.log('Message type:', message.type, 'Room ID:', message.roomId, 'Current Room:', roomId);
        
        // Only process messages from the same room
        if (message.roomId && message.roomId !== roomId) {
            console.log('Ignoring message from different room:', message.roomId, 'vs', roomId);
            return;
        }
        
        // Handle different message types
        const messageType = String(message.type).toUpperCase();
        console.log('Processing message type:', messageType);
        
        if (messageType === 'CHAT') {
            console.log('Chat message from:', message.sender, 'Content:', message.content);
            // Don't show our own messages twice (they're already shown locally)
            if (message.sender !== username) {
                addChatMessage(message.sender, message.content, 'other');
            }
        } else if (messageType === 'JOIN') {
            console.log('User joined:', message.sender);
            addChatMessage('System', message.sender + ' joined the room', 'system');
            updateActiveUsersCount();
        } else if (messageType === 'LEAVE') {
            console.log('User left:', message.sender);
            addChatMessage('System', message.sender + ' left the room', 'system');
            updateActiveUsersCount();
        } else {
            console.log('Unknown message type:', messageType);
        }
    } catch (error) {
        console.error('Error processing chat message:', error);
        console.error('Payload body:', payload.body);
    }
}

function addChatMessage(sender, content, type) {
    const chatMessagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    if (type === 'system') {
        messageDiv.className = 'chat-message system';
        messageDiv.textContent = content;
    } else {
        messageDiv.className = 'chat-message ' + (sender === username ? 'user' : 'other');
        
        // Create sender element
        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        senderDiv.textContent = sender;
        
        // Create content element
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(contentDiv);
    }
    
    chatMessagesDiv.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    setTimeout(() => {
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }, 0);
    
    console.log('Chat message added:', sender, '-', content);
}

function updateActiveUsersCount() {
    fetchRoomUserCount();
}

function fetchRoomUserCount() {
    fetch('/api/rooms/' + roomId + '/users-count')
        .then(response => response.json())
        .then(data => {
            const countElement = document.getElementById('active-users-count');
            if (countElement) {
                countElement.textContent = data.usersCount;
                console.log('Updated user count:', data.usersCount, 'Users:', data.users);
            }
        })
        .catch(error => console.error('Error fetching user count:', error));
}


function onCodeSyncReceived(payload) {
    try {
        const message = JSON.parse(payload.body);
        console.log('Code sync received from:', message.sender);
        
        // Don't apply our own updates back to the editor
        if (message.sender === username) {
            return;
        }
        
        // Set flag to prevent echo
        isRemoteUpdate = true;
        
        // Get current cursor position before update
        const cursor = editor.getCursor();
        const scrollInfo = editor.getScrollInfo();
        
        // Update editor with remote code
        editor.setValue(message.code);
        
        // Restore cursor position (approximately)
        editor.setCursor(cursor);
        editor.scrollTo(scrollInfo.left, scrollInfo.top);
        
        // Reset flag
        isRemoteUpdate = false;
        
    } catch (error) {
        console.error('Error processing code sync:', error);
        isRemoteUpdate = false;
    }
}

function leaveRoom() {
    if (confirm('Are you sure you want to leave this room?')) {
        const params = new URLSearchParams({
            roomId: roomId,
            username: username
        });
        
        fetch('/api/rooms/leave?' + params, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Left room:', data);
            // Disconnect WebSocket and redirect
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {
                    window.location.href = 'index.html';
                });
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Error leaving room:', error);
            window.location.href = 'index.html';
        });
    }
}