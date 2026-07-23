function initSignup() {
    const signupForm = document.getElementById('signupForm');
    const signupButton = signupForm?.querySelector('button[type="submit"]');

    if (!signupForm || !signupButton) {
        console.warn('Signup form or button not found');
        return;
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const reg_no = document.getElementById('reg_no').value.trim();
        const course = document.getElementById('course').value.trim();
        const role = document.getElementById('role').value || 'student';

        if (!name || !email || !password || !confirmPassword || !reg_no || !course) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        signupButton.disabled = true;
        signupButton.textContent = 'Creating account...';

        try {
            const response = await fetch(`/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role,
                    reg_no,
                    course
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showNotification('Account created successfully!', 'success');
                signupButton.textContent = 'Created! Redirecting...';
                setTimeout(() => {
                    const dest = (data.user && data.user.role) ? data.user.role : role;
                    switch (dest) {
                        case 'supervisor':
                            window.location.href = '/pages/supervisor-portal.html';
                            break;
                        case 'lecturer':
                            window.location.href = '/pages/lecturer-dashboard.html';
                            break;
                        case 'admin':
                            window.location.href = '/pages/admin-portal.html';
                            break;
                        default:
                            window.location.href = '/pages/student-dashboard.html';
                    }
                }, 900);
            } else {
                showNotification(data.error || 'Signup failed', 'error');
                signupButton.disabled = false;
                signupButton.textContent = 'Create Account';
            }
        } catch (err) {
            showNotification('Connection error', 'error');
            signupButton.disabled = false;
            signupButton.textContent = 'Create Account';
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignup);
} else {
    initSignup();
}
