const API_URL = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// Dashboard Navigation
document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');

        const sectionId = this.getAttribute('href').substring(1);
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        document.getElementById(sectionId).style.display = 'block';
    });
});

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    const user = getUser();
    document.querySelector('.navbar-brand').textContent = `${user.name} - ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
