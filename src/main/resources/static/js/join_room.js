document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const joinRoomForm = document.getElementById('join-room-form');
    
    if (!user) {
        // User not logged in - show login message
        if (joinRoomForm) {
            joinRoomForm.parentElement.innerHTML = `
                <div class="alert alert-warning">
                    <p><i class="fas fa-lock"></i> You must be logged in to join rooms.</p>
                    <a href="login.html" class="btn btn-primary">Go to Login</a>
                </div>
            `;
        }
        return;
    }
    
    const joinUsernameInput = document.getElementById('join-username');
    const joinRoomIdInput = document.getElementById('join-room-id');
    const joinPasswordInput = document.getElementById('join-password');
    const joinErrorDiv = document.getElementById('join-error');

    // Pre-fill with logged-in user information
    if (user && joinUsernameInput) {
        joinUsernameInput.value = user.username;
        joinUsernameInput.disabled = true; // User cannot change their username
    }

    if (joinRoomForm) {
        joinRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (joinErrorDiv) joinErrorDiv.textContent = '';

            const username = user.username;
            const roomId = joinRoomIdInput.value.trim().toUpperCase();
            const password = joinPasswordInput.value.trim();

            if (!roomId || !password) {
                if (joinErrorDiv) joinErrorDiv.textContent = 'Please fill in all fields.';
                return;
            }

            try {
                const response = await fetch('/api/rooms/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        roomId, 
                        password, 
                        username,
                        userId: user.userId
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || 'Failed to join room.');
                }

                // Room joined successfully, redirect to collab.html
                // Store ONLY password in sessionStorage for later use (not shared data)
                sessionStorage.setItem('roomPassword', password);
                sessionStorage.setItem('currentUserId', user.userId);

                window.location.href = `collab.html?roomId=${roomId}&username=${encodeURIComponent(username)}`;

            } catch (error) {
                console.error('Error joining room:', error);
                if (joinErrorDiv) joinErrorDiv.textContent = error.message;
            }
        });
    }
});

