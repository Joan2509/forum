let isLoginMode = true;
let messageTimeout;

async function checkAuth() {
    try {
        const response = await fetch('/api/protected/api/auth/status');
        const data = await response.json();
        const authButtons = document.getElementById('auth-buttons');
        const userFilters = document.getElementById('userFilters');
        
        authButtons.innerHTML = data.authenticated ? 
            `<div class="auth-status">
                <span class="welcome-text">Welcome, ${data.username}</span>
                <button onclick="logout()" class="auth-btn logout-btn">Logout</button>
            </div>` : '';
        userFilters.style.display = data.authenticated ? 'flex' : 'none';
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

function showAuthMessage(message, type = 'error') {
    clearTimeout(messageTimeout);
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = message ? 'block' : 'none';
    messageDiv.className = `auth-message ${type}`;

    if (type === 'success') {
        messageTimeout = setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function setupFormListeners() {
    const form = document.getElementById('authForm');
    const inputs = form.querySelectorAll('input');
    const messageDiv = document.getElementById('authMessage');
    
    function clearErrorMessage() {
        if (messageDiv.classList.contains('error')) {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
        }
    }
    
    inputs.forEach(input => {
        input.addEventListener('input', clearErrorMessage);
        input.addEventListener('focus', clearErrorMessage);
    });
}

function validatePassword(password) {
    if (!password) {
        throw new Error('Password is required');
    }
    
    const requirements = {
        minLength: password.length >= 8,
        hasAlphanumeric: /[a-zA-Z]/.test(password) && /\d/.test(password),
        hasAllowedSpecialChar: /^[a-zA-Z0-9@#]*$/.test(password)
    };

    if (!Object.values(requirements).every(Boolean)) {
        throw new Error('Password must be at least 8 characters long, include alphanumeric characters, and may contain special characters @ or #.');
    }
}

function validateForm() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const username = document.getElementById('username')?.value.trim();

    if (!email || (!isLoginMode && !username)) {
        showAuthMessage('Please fill in all fields');
        return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showAuthMessage('Please enter a valid email address');
        return false;
    }

    try {
        validatePassword(password);
    } catch (error) {
        showAuthMessage(error.message);
        return false;
    }

    showAuthMessage('', 'none');
    return true;
}

function openAuthModal(mode, message = '') {
    isLoginMode = mode === 'login';
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('usernameGroup').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('authModal').classList.add('active');
    document.querySelector('.modal-switch').textContent = `${isLoginMode ? 'Register' : 'Login'} Instead`;
    document.querySelector('.modal-submit').textContent = isLoginMode ? 'Login' : 'Register';
    
    if (message) {
        showAuthMessage(message, 'success');
    } else {
        showAuthMessage('', 'none');
    }
    
    setupFormListeners();
}

function closeAuthModal() {
    clearTimeout(messageTimeout);
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('authForm').reset();
    showAuthMessage('', 'none');
}

async function handleAuth(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const formData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        username: isLoginMode ? undefined : document.getElementById('username').value.trim()
    };

    try {
        const response = await fetch(`/api/${isLoginMode ? 'login' : 'register'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (isLoginMode) {
                showAuthMessage(data.message || 'Invalid email or password. Please try again.');
                return;
            } else {
                switch (response.status) {
                    case 409:
                        showAuthMessage(`This ${data.field || 'email/username'} is already registered. Please use a different one.`);
                        break;
                    case 400:
                        showAuthMessage(data.message || 'Invalid registration data. Please check your input.');
                        break;
                    default:
                        showAuthMessage('Registration failed. Please try again.');
                }
            }
            return;
        }

        if (isLoginMode) {
            showAuthMessage('Login successful!', 'success');
            closeAuthModal();
            window.location.reload();
        } else {
            document.getElementById('authForm').reset();
            openAuthModal('login', 'Registration successful! Please login with your credentials.');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showAuthMessage('An error occurred. Please try again later.');
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
