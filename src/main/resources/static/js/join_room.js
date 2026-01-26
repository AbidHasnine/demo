document.addEventListener('DOMContentLoaded', () => {
    const joinRoomForm = document.getElementById('join-room-form');
    const joinUsernameInput = document.getElementById('join-username');
    const joinRoomIdInput = document.getElementById('join-room-id');
    const joinPasswordInput = document.getElementById('join-password');
    const joinErrorDiv = document.getElementById('join-error');

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
        joinUsernameInput.value = getUsername();
    }

    joinRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        joinErrorDiv.textContent = '';

        const username = joinUsernameInput.value.trim();
        const roomId = joinRoomIdInput.value.trim().toUpperCase();
        const password = joinPasswordInput.value.trim();

        if (!username || !roomId || !password) {
            joinErrorDiv.textContent = 'Please fill in all fields.';
            return;
        }

        setUsername(username); // Save username to local storage

        try {
            const response = await fetch('/api/rooms/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId, password, username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to join room.');
            }

            // Room joined successfully, redirect to collab.html
            // Store ONLY password in sessionStorage for later use (not shared data)
            sessionStorage.setItem('roomPassword', password);

            window.location.href = `collab.html?roomId=${roomId}&username=${encodeURIComponent(username)}`;

        } catch (error) {
            console.error('Error joining room:', error);
            joinErrorDiv.textContent = error.message;
        }
    });
});
