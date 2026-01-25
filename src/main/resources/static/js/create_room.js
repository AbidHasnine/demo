document.addEventListener('DOMContentLoaded', () => {
    const createRoomForm = document.getElementById('create-room-form');
    const creatorUsernameInput = document.getElementById('creator-username');
    const roomNameInput = document.getElementById('room-name');
    const roomPasswordInput = document.getElementById('room-password');
    const createErrorDiv = document.getElementById('create-error');
    const roomModal = document.getElementById('room-modal');
    const roomCreatedModal = document.getElementById('room-created-modal');
    const createdRoomIdSpan = document.getElementById('created-room-id');
    const createdRoomPasswordSpan = document.getElementById('created-room-password');

    // Function to set username in local storage
    const setUsername = (username) => {
        localStorage.setItem('username', username);
    };

    // Function to get username from local storage
    const getUsername = () => {
        return localStorage.getItem('username');
    };

    // Populate username if it exists in local storage
    if (getUsername()) {
        creatorUsernameInput.value = getUsername();
    }

    createRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        createErrorDiv.textContent = '';

        const username = creatorUsernameInput.value.trim();
        const roomName = roomNameInput.value.trim();
        const roomPassword = roomPasswordInput.value.trim();

        if (!username || !roomName || !roomPassword) {
            createErrorDiv.textContent = 'Please fill in all fields.';
            return;
        }

        if (roomPassword.length < 4) {
            createErrorDiv.textContent = 'Room password must be at least 4 characters long.';
            return;
        }

        setUsername(username); // Save username to local storage

        try {
            const response = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: roomName, password: roomPassword, creatorUsername: username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create room.');
            }

            const room = await response.json();
            createdRoomIdSpan.textContent = room.roomId;
            createdRoomPasswordSpan.textContent = room.password; // Display actual password

            // Store room credentials temporarily to pass to collab.html
            sessionStorage.setItem('roomId', room.roomId);
            sessionStorage.setItem('roomPassword', room.password);
            sessionStorage.setItem('username', username);

            roomModal.style.display = 'none';
            roomCreatedModal.style.display = 'flex';

        } catch (error) {
            console.error('Error creating room:', error);
            createErrorDiv.textContent = error.message;
        }
    });

    window.copyToClipboard = (elementId) => {
        const element = document.getElementById(elementId);
        const textToCopy = element.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Copied to clipboard: ' + textToCopy);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    window.enterRoom = () => {
        const roomId = sessionStorage.getItem('roomId');
        const username = sessionStorage.getItem('username');
        const roomPassword = sessionStorage.getItem('roomPassword'); // Get password from session storage

        if (roomId && username && roomPassword) {
            // Navigate to collab.html and pass credentials via URL parameters or session storage
            // For simplicity and security, we'll use session storage here and clear after use.
            window.location.href = `collab.html?roomId=${roomId}&username=${username}`;
        } else {
            alert('Room information not found. Please create or join a room first.');
            window.location.href = 'index.html'; // Redirect to home if no room info
        }
    };
});
