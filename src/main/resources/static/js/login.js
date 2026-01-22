// Login page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkLoginStatus();
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const switchLinks = document.querySelectorAll('.switch-link');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    switchLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.getElementById(`${tab}-form`).classList.add('active');
    
    // Clear error messages
    clearMessages();
}

function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add('show');
}

function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add('show');
}

async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showError('login-error', 'Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                userId: data.userId,
                username: data.username,
                displayName: data.displayName
            }));
            
            // Show user info
            showLoggedInState(data.displayName, data.username);
        } else {
            showError('login-error', data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Connection error. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    clearMessages();
    
    const username = document.getElementById('register-username').value.trim();
    const displayName = document.getElementById('register-display-name').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validation
    if (!username || !password || !confirmPassword) {
        showError('register-error', 'Please fill in all required fields');
        return;
    }
    
    if (password.length < 4) {
        showError('register-error', 'Password must be at least 4 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('register-error', 'Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, displayName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('register-success', 'Registration successful! You can now login.');
            
            // Clear form
            document.getElementById('register-form').reset();
            
            // Switch to login tab after 2 seconds
            setTimeout(() => {
                switchTab('login');
                document.getElementById('login-username').value = username;
            }, 2000);
        } else {
            showError('register-error', data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('register-error', 'Connection error. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('user');
    showLoggedOutState();
}

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.username) {
        showLoggedInState(user.displayName, user.username);
    } else {
        showLoggedOutState();
    }
}

function showLoggedInState(displayName, username) {
    document.querySelector('.login-box').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('user-display-name').textContent = displayName;
    document.getElementById('user-username').textContent = username;
}

function showLoggedOutState() {
    document.querySelector('.login-box').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
}

// Export function for use in other pages
window.getCurrentUser = function() {
    return JSON.parse(localStorage.getItem('user'));
};

window.isLoggedIn = function() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.username;
};
