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
        
        // Enhanced password validation
        if (password.length < 8) {
            messageDiv.textContent = 'Password must be at least 8 characters long';
            return false;
        }
        
        if (!/\d/.test(password)) {
            messageDiv.textContent = 'Password must contain at least one number';
            return false;
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            messageDiv.textContent = 'Password must contain at least one special character';
            return false;
        }
        
        if (!/[A-Z]/.test(password)) {
            messageDiv.textContent = 'Password must contain at least one uppercase letter';
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
    const strengthContainer = document.getElementById('password-strength-container');
    const requirementsDiv = document.getElementById('password-requirements');
    
    modalTitle.textContent = isLoginMode ? 'Login' : 'Register';
    
    if (message) {
        showAuthSuccess(message);
    } else {
        messageDiv.style.display = 'none';
    }
    
    // Show/hide password strength elements and requirements based on mode
    strengthContainer.style.display = isLoginMode ? 'none' : 'block';
    requirementsDiv.style.display = isLoginMode ? 'none' : 'block';
    
    document.getElementById('usernameGroup').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('authModal').classList.add('active');
    document.querySelector('.modal-switch').textContent = isLoginMode ? 'Register Instead' : 'Login Instead';
    document.querySelector('.modal-submit').textContent = isLoginMode ? 'Login' : 'Register';
    
    // Reset password strength meter and requirements
    if (!isLoginMode) {
        checkPasswordStrength('');
    }
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

        let data;
        try {
            data = await response.json(); // Safely parse JSON
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            data = {}; // Ensure `data` is at least an empty object
        }

        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

        if (!response.ok) {
            if (response.status === 401) {
                console.log("Triggering: Wrong email or password"); // Debug log
                showAuthError("Wrong email or password");
                return;

            } else {
                showAuthError(data?.message || "Authentication failed");
                return;
            }
        }

        if (isLoginMode) {
            handleSuccess("Login successful!");
            closeAuthModal();
            startAuthStatusCheck();
            window.location.reload();
        } else {
            document.getElementById("authForm").reset();
            openAuthModal("login", "Registration successful! Please login with your credentials.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        showAuthError("An error occurred. Please try again.");
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

// Update the checkPasswordStrength function
function checkPasswordStrength(password) {
    const strengthMeter = document.getElementById('password-strength');
    const strengthText = document.getElementById('strength-text');
    
    // Get requirement elements
    const lengthCheck = document.getElementById('length-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    
    if (!password) {
        strengthMeter.style.width = '0%';
        strengthMeter.style.backgroundColor = '#e0e0e0';
        strengthText.textContent = '';
        
        // Reset all requirement checks
        [lengthCheck, numberCheck, specialCheck, uppercaseCheck].forEach(check => {
            check.classList.remove('valid');
        });
        return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) {
        strength += 25;
        lengthCheck.classList.add('valid');
    } else {
        lengthCheck.classList.remove('valid');
    }

    // Contains number
    if (/\d/.test(password)) {
        strength += 25;
        numberCheck.classList.add('valid');
    } else {
        numberCheck.classList.remove('valid');
    }

    // Contains special char
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength += 25;
        specialCheck.classList.add('valid');
    } else {
        specialCheck.classList.remove('valid');
    }

    // Contains uppercase
    if (/[A-Z]/.test(password)) {
        strength += 25;
        uppercaseCheck.classList.add('valid');
    } else {
        uppercaseCheck.classList.remove('valid');
    }

    // Update strength meter
    strengthMeter.style.width = `${strength}%`;
    
    // Update color based on strength
    if (strength <= 25) {
        strengthMeter.style.backgroundColor = '#ff4d4d';
        strengthText.textContent = 'Weak';
    } else if (strength <= 50) {
        strengthMeter.style.backgroundColor = '#ffd700';
        strengthText.textContent = 'Fair';
    } else if (strength <= 75) {
        strengthMeter.style.backgroundColor = '#2ecc71';
        strengthText.textContent = 'Good';
    } else {
        strengthMeter.style.backgroundColor = '#27ae60';
        strengthText.textContent = 'Strong';
    }
}