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
            authButtons.innerHTML = `
                <button onclick="openAuthModal('login')" class="auth-btn">Login</button>
                <button onclick="openAuthModal('register')" class="auth-btn">Register</button>
            `;
            userFilters.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Handle error state
        const authButtons = document.getElementById('auth-buttons');
        authButtons.innerHTML = `
            <button onclick="openAuthModal('login')" class="auth-btn">Login</button>
            <button onclick="openAuthModal('register')" class="auth-btn">Register</button>
        `;
        document.getElementById('userFilters').style.display = 'none';
    }
}

function validateForm() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const username = document.getElementById('username')?.value.trim();

    const messageDiv = document.getElementById('authMessage');
    messageDiv.style.display = 'block';
    messageDiv.className = 'auth-message error';

    if (isLoginMode) {
        // Login validation
        if (!email || !password) {
            messageDiv.textContent = 'Please fill in all fields';
            return false;
        }
    } else {
        // Email validation
        if (!email) {
            messageDiv.textContent = 'Email is required';
            return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            messageDiv.textContent = 'Please enter a valid email address';
            return false;
        }

        // Password validation
        if (!password) {
            messageDiv.textContent = 'Password is required';
            return false;
        }
        if (password.length < 6) {
            messageDiv.textContent = 'Password must be at least 6 characters long';
            return false;
        }

        // Username validation
        if (!username) {
            messageDiv.textContent = 'Username is required';
            return false;
        }
    }

    messageDiv.style.display = 'none';
    return true;
}

function showAuthError(message) {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.className = 'auth-message error';
}

function showAuthSuccess(message) {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.className = 'auth-message success';
}

function openAuthModal(mode, message = '') {
    isLoginMode = mode === 'login';
    const modalTitle = document.getElementById('modalTitle');
    const messageDiv = document.getElementById('authMessage');
    
    modalTitle.textContent = isLoginMode ? 'Login' : 'Register';
    
    if (message) {
        showAuthSuccess(message);
    } else {
        messageDiv.style.display = 'none';
    }
    
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

// periodically check auth status
function startAuthStatusCheck() {
    setInterval(async () => {
        try {
            const response = await fetch('/api/protected/api/auth/status');
            if (!response.ok) {
                // If logged out
                handleError('Your session has ended. Please login again.');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }, 30000); // Check every 30 seconds
}

// Called after loging in successfully
async function handleAuth(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const username = document.getElementById('username')?.value.trim();

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

        const data = await response.json();

        if (!response.ok) {
            // Handle specific error cases
            switch (response.status) {
                case 409: 
                    showAuthError('This username or email is already taken');
                    break;
                case 401:
                    showAuthError('Wrong email or password');
                    break;
                default:
                    showAuthError(data.message || 'Authentication failed');
            }
            return;
        }

        if (isLoginMode) {
            handleSuccess('Login successful!');
            closeAuthModal();
            startAuthStatusCheck();
            window.location.reload();
        } else {
            // Fswitch to login mode
            document.getElementById('authForm').reset();
            openAuthModal('login', 'Registration successful! Please login with your credentials.');
        }
    } catch (error) {
        showAuthError('An error occurred. Please try again.');
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