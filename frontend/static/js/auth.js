// Authentication related functions
let isLoginMode = true;

async function checkAuth() {
    try {
        const response = await fetch('/api/protected/api/auth/status');
        const data = await response.json();
        const authButtons = document.getElementById('auth-buttons');
        const userFilters = document.getElementById('userFilters');
        
        if (data.authenticated) {
            authButtons.innerHTML = `
                <div class="auth-status">
                    <span class="welcome-text">Welcome, ${data.username}</span>
                    <button onclick="logout()" class="auth-btn logout-btn">Logout</button>
                </div>
            `;
            userFilters.style.display = 'flex';
        } else {
            userFilters.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}
function openAuthModal(mode) {
    isLoginMode = mode === 'login';
    document.getElementById('modalTitle').textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('usernameGroup').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('authModal').classList.add('active');
    document.querySelector('.modal-switch').textContent = isLoginMode ? 'Register Instead' : 'Login Instead';
    document.querySelector('.modal-submit').textContent = isLoginMode ? 'Login' : 'Register';
}
function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('authForm').reset();
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    openAuthModal(isLoginMode ? 'login' : 'register');
}

// Add this function to periodically check auth status
function startAuthStatusCheck() {
    setInterval(async () => {
        try {
            const response = await fetch('/api/protected/api/auth/status');
            if (!response.ok) {
                // If we get an unauthorized response, we've been logged out
                handleError('Your session has ended. Please login again.');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }, 30000); // Check every 30 seconds
}

// Call this function after successful login
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    try {
        const response = await fetch(`/api/${isLoginMode ? 'login' : 'register'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                username: isLoginMode ? undefined : username
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Authentication failed');
        }

        handleSuccess(isLoginMode ? 'Login successful!' : 'Registration successful!');
        closeAuthModal();
        
        if (isLoginMode) {
            startAuthStatusCheck(); // Start checking auth status after login
        }
        
        window.location.reload();
    } catch (error) {
        handleError(error.message);
    }
}

async function logout() {
    try {
        await fetch('/api/protected/api/logout', { method: 'POST' });
        window.location.reload();
    } catch (error) {
        console.error('Error logging out:', error);
    }
}