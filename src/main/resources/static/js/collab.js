// Collab Space JavaScript with WebSocket Integration and Room Support

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
let username = null;
let roomId = null;
let sessionId = null;
let terminalBuffer = "";

// CodeMirror related globals
let editor = null; 

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('roomId') || sessionStorage.getItem('roomId');
    username = urlParams.get('username') || sessionStorage.getItem('username');

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

    connect();
    
    document.getElementById('run-code-btn').addEventListener('click', handleRunCode);
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    document.getElementById('clear-terminal-btn').addEventListener('click', clearTerminal);
    document.getElementById('terminal-input').addEventListener('keypress', handleTerminalKeypress);
    document.getElementById('submit-input-btn').addEventListener('click', submitTerminalInput);

    document.getElementById('current-room-id').textContent = roomId;
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

    stompClient.subscribe('/user/' + sessionId + '/topic/compiler/output', onCompilerOutputReceived);
    document.getElementById('connection-status').classList.add('connected');
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