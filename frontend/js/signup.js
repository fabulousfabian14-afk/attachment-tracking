document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const reg_no = document.getElementById('reg_no').value;
    const course = document.getElementById('course').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        const role = document.getElementById('role').value || 'student';
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
            }, 800);
        } else {
            showNotification(data.error || 'Signup failed', 'error');
        }
    } catch (err) {
        showNotification('Connection error', 'error');
    }
});
