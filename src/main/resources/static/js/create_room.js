document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const createRoomForm = document.getElementById('create-room-form');
    
    if (!user) {
        // User not logged in - show login message
        if (createRoomForm) {
            createRoomForm.parentElement.innerHTML = `
                <div class="alert alert-warning">
                    <p><i class="fas fa-lock"></i> You must be logged in to create rooms.</p>
                    <a href="login.html" class="btn btn-primary">Go to Login</a>
                </div>
            `;
        }
        return;
    }
    
    const creatorUsernameInput = document.getElementById('creator-username');
    const roomNameInput = document.getElementById('room-name');
    const roomPasswordInput = document.getElementById('room-password');
    const createErrorDiv = document.getElementById('create-error');
    const roomModal = document.getElementById('room-modal');
    const roomCreatedModal = document.getElementById('room-created-modal');
    const createdRoomIdSpan = document.getElementById('created-room-id');
    const createdRoomPasswordSpan = document.getElementById('created-room-password');

    // Pre-fill with logged-in user information
    if (user && creatorUsernameInput) {
        creatorUsernameInput.value = user.username;
        creatorUsernameInput.disabled = true; // User cannot change their username
    }

    if (createRoomForm) {
        createRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (createErrorDiv) createErrorDiv.textContent = '';

            const username = user.username;
            const roomName = roomNameInput.value.trim();
            const roomPassword = roomPasswordInput.value.trim();

            if (!roomName || !roomPassword) {
                if (createErrorDiv) createErrorDiv.textContent = 'Please fill in all fields.';
                return;
            }

            if (roomPassword.length < 4) {
                if (createErrorDiv) createErrorDiv.textContent = 'Room password must be at least 4 characters long.';
                return;
            }

            try {
                const response = await fetch('/api/rooms/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        name: roomName, 
                        password: roomPassword, 
                        creatorUsername: username,
                        username: user.username,
                        creatorId: user.userId
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || 'Failed to create room.');
                }

                const room = await response.json();
                createdRoomIdSpan.textContent = room.roomId;
                createdRoomPasswordSpan.textContent = room.password; // Display actual password

                // Store ONLY password in sessionStorage for later use (not shared data)
                sessionStorage.setItem('roomPassword', room.password);
                sessionStorage.setItem('currentRoomId', room.roomId);
                sessionStorage.setItem('currentUsername', username);
                sessionStorage.setItem('currentUserId', user.userId);

                if (roomModal) roomModal.style.display = 'none';
                if (roomCreatedModal) roomCreatedModal.style.display = 'flex';

            } catch (error) {
                console.error('Error creating room:', error);
                if (createErrorDiv) createErrorDiv.textContent = error.message;
            }
        });
    }

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
        const roomId = sessionStorage.getItem('currentRoomId');
        const username = sessionStorage.getItem('currentUsername');
        const roomPassword = sessionStorage.getItem('roomPassword');

        if (roomId && username && roomPassword) {
            // Navigate to collab.html - pass ALL data via URL to avoid cross-tab contamination
            window.location.href = `collab.html?roomId=${roomId}&username=${encodeURIComponent(username)}`;
        } else {
            alert('Room information not found. Please create or join a room first.');
            window.location.href = 'index.html'; // Redirect to home if no room info
        }
    };
});

