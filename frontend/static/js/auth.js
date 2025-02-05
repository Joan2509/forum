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
