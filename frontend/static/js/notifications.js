// Notifications and toast messages
function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => toast.remove();
    
    toast.appendChild(icon);
    toast.appendChild(messageSpan);
    toast.appendChild(closeBtn);
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function handleError(message) {
    showToast(message, 'error');
}

function handleSuccess(message) {
    showToast(message, 'success');
} 