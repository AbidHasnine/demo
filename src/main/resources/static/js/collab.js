// Collab Space JavaScript with WebSocket Integration and Room Support

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
let username = null;
let roomId = null;

// CodeMirror related globals
let editor = null; // CodeMirror instance
let isTyping = false;
let typingTimeout = null; // Debounce timer for code changes
let typingUsers = new Set(); // To track users currently typing (for text area)
let typingTimeouts = new Map(); // To manage individual user typing timeouts
let remoteCursors = new Map(); // Maps username to an object containing {cursor: CodeMirror.TextMarker, selection: CodeMirror.TextMarker}
let cursorActivityTimeout = null; // Debounce timer for cursor activity

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve roomId and username from URL parameters or session storage
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('roomId') || sessionStorage.getItem('roomId');
    username = urlParams.get('username') || sessionStorage.getItem('username');

    if (!roomId || !username) {
        alert('Room ID and username are required to enter the collaboration space.');
        window.location.href = 'index.html'; // Redirect to home if no room info
        return;
    }

    // Initialize CodeMirror for C++ only
    editor = CodeMirror(document.getElementById('code-editor-container'), {
        mode: 'text/x-c++src', // C++ mode
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        extraKeys: { "Ctrl-Space": "autocomplete" },
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: true
    });

    // Event listener for CodeMirror content changes
    editor.on('change', handleCodeInput);

    // Event listener for CodeMirror cursor activity
    editor.on('cursorActivity', debounceSendCursorActivity);

    // Auto-connect to WebSocket
    connect();
    
    // Form submissions
    document.getElementById('message-form').addEventListener('submit', sendMessage);
    
    // Leave room button
    document.getElementById('leave-room-btn').addEventListener('click', handleLeaveRoom);
    
    // Run Code Button
    document.getElementById('run-code-btn').addEventListener('click', handleRunCode);
    
    // Clear Input Button
    document.getElementById('clear-input-btn').addEventListener('click', () => {
        document.getElementById('input-terminal').value = '';
    });
    
    // Clear Output Button
    document.getElementById('clear-output-btn').addEventListener('click', () => {
        const consoleEl = document.getElementById('output-console');
        consoleEl.innerHTML = '<span class="placeholder-text">Click "Run Code" to see output here...</span>';
        consoleEl.className = 'output-console';
    });

    // Update the room display and fetch initial code/language
    document.getElementById('current-room-id').textContent = roomId;
    fetch(`/api/rooms/${roomId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.name) {
                document.getElementById('current-room-name').textContent = data.name;
                // Load initial code and language if available
                if (data.currentCode) {
                    editor.setValue(data.currentCode);
                }
            } else {
                document.getElementById('current-room-name').textContent = `Room ${roomId}`;
            }
        })
        .catch(error => {
            console.error('Error fetching room details:', error);
            document.getElementById('current-room-name').textContent = `Room ${roomId}`;
        });
});

// Helper to remove all markers for a specific user
function clearUserMarkers(sender) {
    if (remoteCursors.has(sender)) {
        const markers = remoteCursors.get(sender);
        if (markers.cursor) markers.cursor.clear();
        if (markers.selection) markers.selection.clear();
        remoteCursors.delete(sender);
    }
}

// Debounce function for sending cursor activity
function debounceSendCursorActivity() {
    if (cursorActivityTimeout) {
        clearTimeout(cursorActivityTimeout);
    }
    cursorActivityTimeout = setTimeout(() => {
        sendCursorActivity();
    }, 100); // Send cursor activity every 100ms
}

// Function to send cursor and selection activity
function sendCursorActivity() {
    const doc = editor.getDoc();
    const cursor = doc.getCursor();
    const selections = doc.listSelections(); // Get all selections

    let selectionsToSend = null;
    if (selections && selections.length > 0 && !selections[0].empty()) {
        const selection = selections[0]; // For simplicity, send only the first selection
        selectionsToSend = {
            anchor: { line: selection.anchor.line, ch: selection.anchor.ch },
            head: { line: selection.head.line, ch: selection.head.ch }
        };
    }

    sendCodeSyncMessage({
        type: 'CURSOR_ACTIVITY',
        cursor: { line: cursor.line, ch: cursor.ch },
        selection: selectionsToSend
    });
}

// Handle Run Code
async function handleRunCode() {
    const runBtn = document.getElementById('run-code-btn');
    const outputConsole = document.getElementById('output-console');
    const inputTerminal = document.getElementById('input-terminal');
    const code = editor.getValue(); // Get code from CodeMirror instance
    const input = inputTerminal.value; // Get input from input terminal
    
    if (!code || !code.trim()) {
        outputConsole.textContent = 'Please enter some code to run.';
        outputConsole.classList.add('error');
        return;
    }
    
    // Disable button and show loading
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    outputConsole.innerHTML = '<span class="placeholder-text">Executing C++ code...</span>';
    outputConsole.className = 'output-console';
    
    try {
        const response = await fetch('/api/compiler/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                language: 'cpp',
                input: input
            })
        });
        
        const data = await response.json();
        
        if (data.output) {
            outputConsole.textContent = data.output;
            if (data.error) {
                outputConsole.classList.add('error');
            }
        } else {
            outputConsole.textContent = 'No output returned.';
        }
        
    } catch (error) {
        console.error('Execution error:', error);
        outputConsole.textContent = 'Error executing code. Please try again.';
        outputConsole.classList.add('error');
    } finally {
        // Re-enable button
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
    }
}

// Leave Room Handler
async function handleLeaveRoom() {
    if (stompClient && stompClient.connected) {
        // Send leave message (for chat presence)
        stompClient.send(`/app/chat.leaveRoom/${roomId}`, {}, JSON.stringify({
            sender: username,
            type: 'LEAVE',
            roomId: roomId
        }));
        // Note: For CodeMirror we might need to clear cursors here as well
        stompClient.disconnect();
    }
    
    // Clear session storage
    sessionStorage.removeItem('roomId');
    sessionStorage.removeItem('username');
    
    // Redirect to index.html
    window.location.href = 'index.html';
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
    
    // Send join message (for chat and code sync presence)
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
        updateActiveUsersCount(1);
    } else if (message.type === 'LEAVE') {
        addSystemMessage(`${message.sender} left the room`);
        updateActiveUsersCount(-1);
        clearUserMarkers(message.sender); // Clear remote cursor/selection when user leaves
    } else if (message.type === 'CHAT') {
        addChatMessage(message.sender, message.content);
    }
}

function updateActiveUsersCount(change) {
    const countEl = document.getElementById('active-users-count');
    const currentCount = parseInt(countEl.textContent);
    const newCount = currentCount + change;
    if (newCount >= 0) {
        countEl.textContent = newCount;
    }
}

// Handle incoming code updates
function onCodeReceived(payload) {
    const message = JSON.parse(payload.body);
    const editorEl = editor.getWrapperElement(); // Get CodeMirror's DOM element

    // Don't process our own messages
    if (message.sender === username) {
        // If it's our own update, reset our typing status
        if (message.type === 'UPDATE') {
            isTyping = false;
            sentTypingMessage = false;
        }
        return;
    }

    // Clear any previous timer for this user
    if (typingTimeouts.has(message.sender)) {
        clearTimeout(typingTimeouts.get(message.sender));
        typingTimeouts.delete(message.sender);
    }

    switch (message.type) {
        case 'TYPING':
            typingUsers.add(message.sender);
            editorEl.classList.add('typing-remote'); // Add class to editor to indicate typing

            // Set a new timeout to remove the user from typingUsers if they stop
            const typingStopTimeout = setTimeout(() => {
                typingUsers.delete(message.sender);
                updateTypingStatusDisplay();
                // Remove typing-remote class if no one is typing
                if (typingUsers.size === 0) {
                    editorEl.classList.remove('typing-remote');
                }
            }, 2000); // 2 seconds to consider them stopped
            typingTimeouts.set(message.sender, typingStopTimeout);
            break;

        case 'UPDATE':
            // Remove user from typing status immediately on update
            typingUsers.delete(message.sender);
            
            // Remove typing-remote class if no one is typing
            if (typingUsers.size === 0) {
                editorEl.classList.remove('typing-remote');
            }

            // CRITICAL: Only update the content if the local user is not in the middle of typing.
            // This is a simple lock to prevent losing local changes.
            if (!isTyping) {
                const doc = editor.getDoc();
                const cursor = doc.getCursor(); // Save current cursor position
                editor.setValue(message.code);
                doc.setCursor(cursor); // Restore cursor position
            }
            clearUserMarkers(message.sender); // Clear cursor/selection on code update
            break;

        case 'CURSOR_ACTIVITY':
            clearUserMarkers(message.sender); // Clear old markers for this user

            const doc = editor.getDoc();
            const cursor = message.cursor;
            const selection = message.selection;

            let userMarkers = { cursor: null, selection: null };

            // Render cursor
            if (cursor) {
                // For more advanced cursors, you'd create a custom widget or overlay
                const cursorElement = document.createElement('span');
                const userColor = getUserColor(message.sender); // Get a consistent color for the user
                cursorElement.style.borderLeft = `2px solid ${userColor}`;
                cursorElement.style.height = editor.defaultTextHeight() + 'px';
                cursorElement.style.position = 'absolute';
                cursorElement.style.zIndex = '1';
                cursorElement.title = message.sender; // Show username on hover

                userMarkers.cursor = doc.setBookmark(cursor, { widget: cursorElement, insertLeft: true });
            }

            // Render selection
            if (selection && (selection.anchor.line !== selection.head.line || selection.anchor.ch !== selection.head.ch)) {
                const userColor = getUserColor(message.sender);
                userMarkers.selection = doc.markText(selection.anchor, selection.head, {
                    className: 'CodeMirror-remote-selection',
                    css: `background-color: ${userColor}33;`, // Add transparency (e.g., 33 for 20%)
                    inclusiveLeft: true,
                    inclusiveRight: false
                });
            }

            remoteCursors.set(message.sender, userMarkers);
            break;
    }
    updateTypingStatusDisplay();
}

// Function to update the editor typing status display
function updateTypingStatusDisplay() {
    const editorUserEl = document.getElementById('editor-user');
    editorUserEl.textContent = ''; 
    editorUserEl.style.display = 'none';

    if (typingUsers.size === 0 && remoteCursors.size === 0) { // Check both typingUsers and active cursors
        editorUserEl.textContent = ''; 
        editorUserEl.style.display = 'none';
    } else {
        const activeUsers = new Set([...typingUsers, ...Array.from(remoteCursors.keys())]);
        activeUsers.delete(username); // Don't show ourselves

        if (activeUsers.size === 0) {
            editorUserEl.textContent = '';
            editorUserEl.style.display = 'none';
        } else if (activeUsers.size === 1) {
            const [typer] = activeUsers;
            editorUserEl.textContent = `${typer} is active...`; // Changed to 'active' to include cursor activity
            editorUserEl.style.display = 'block';
        } else {
            const typers = Array.from(activeUsers);
            let statusText = '';
            if (typers.length <= 3) {
                const lastTyper = typers.pop();
                statusText = `${typers.join(', ')} and ${lastTyper} are active...`;
            } else {
                statusText = `${typers.slice(0, 2).join(', ')} and ${typers.length - 2} others are active...`;
            }
            editorUserEl.textContent = statusText;
            editorUserEl.style.display = 'block';
        }
    }
}

// Function to generate a consistent color for each user
function getUserColor(userName) {
    // Simple hash function to get a consistent color
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
        hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
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

// Central function to send any code sync message (typing status or full update)
function sendCodeSyncMessage(payload) {
    if (stompClient && stompClient.connected && roomId) {
        const message = {
            sender: username,
            roomId: roomId,
            ...payload // Spread the payload (e.g., type, code, language, cursor, selection)
        };
        stompClient.send(`/app/code.sync/${roomId}`, {}, JSON.stringify(message));
    }
}

// Flag to track if we've already sent the "TYPING" message
let sentTypingMessage = false;

// Handle code editor input with debouncing
function handleCodeInput() {
    isTyping = true;

    // If we haven't told the server we're typing yet, send the TYPING status
    if (!sentTypingMessage) {
        sendCodeSyncMessage({ type: 'TYPING' });
        sentTypingMessage = true;
    }
    
    // Clear the timeout every time the user types, resetting the timer
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // After the user pauses for 500ms, send the full code update
    typingTimeout = setTimeout(() => {
        const code = editor.getValue(); // Get code from CodeMirror
        
        // Send the complete code as an UPDATE
        sendCodeSyncMessage({
            type: 'UPDATE',
            code: code,
            language: 'cpp'
        });
        
        // Reset flags
        isTyping = false;
        sentTypingMessage = false;
    }, 500); // 500ms debounce timer
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