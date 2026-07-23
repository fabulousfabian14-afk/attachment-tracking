console.log('student.js top-level execution');
const API_URL = '/api';

let studentAttachments = [];
let currentStudent = null;

async function loadStudentDashboard() {
    try {
        const response = await fetch(`${API_URL}/students/dashboard`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) {
            showNotification('Unable to load dashboard, please login again', 'error');
            return;
        }

        const data = await response.json();
        currentStudent = data.student || null;
        studentAttachments = data.attachments || [];

        document.getElementById('activeAttachments').textContent = data.attachments?.length ?? 0;
        document.getElementById('logbookCount').textContent = data.logbookCount ?? 0;
        document.getElementById('pendingCount').textContent = data.pendingLogbooks ?? 0;

        loadAttachments(studentAttachments);
        populateProfileFields(currentStudent);
        populateReportSelect(studentAttachments);
        populateAttachmentSelect(studentAttachments);
    } catch (err) {
        showNotification('Dashboard load failed', 'error');
    }
}

function populateProfileFields(student) {
    // If no student provided, try to fallback to localStorage 'user'
    if (!student) {
        try {
            const stored = JSON.parse(localStorage.getItem('user'));
            student = stored || student;
        } catch (e) {
            // ignore
        }
    }

    if (!student) return;

    const setIfExists = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        try { el.value = value || ''; } catch (e) { el.textContent = value || ''; }
    };

    setIfExists('profileName', student.name || '');
    setIfExists('profileEmail', student.email || '');
    setIfExists('profileRegNo', student.reg_no || '');
    setIfExists('profileCourse', student.course || '');

    // Backwards-compatibility: also populate short IDs if present
    setIfExists('name', student.name || '');
    setIfExists('email', student.email || '');
    setIfExists('reg_no', student.reg_no || '');
    setIfExists('course', student.course || '');
}

function populateReportSelect(attachments) {
    const reportSelect = document.getElementById('reportAttachmentId');
    if (!reportSelect) return;

    reportSelect.innerHTML = '<option value="">Select Attachment</option>' +
        attachments.map(a => `<option value="${a.id}">${a.company_name || 'N/A'} (${a.start_date} - ${a.end_date})</option>`).join('');
}

function populateAttachmentSelect(attachments) {
    const selectIds = ['attachmentId', 'reportAttachmentId'];
    selectIds.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '<option value="">Select Attachment</option>' +
            attachments.map(a => `<option value="${a.id}">${a.company_name || 'N/A'} (${a.start_date} - ${a.end_date})</option>`).join('');
    });
}

function setProfileEditing(enabled) {
    ['profileName', 'profileEmail', 'profileRegNo', 'profileCourse', 'name', 'email', 'reg_no', 'course'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.disabled = !enabled;
    });

    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelProfileBtn');

    if (editBtn) editBtn.style.display = enabled ? 'none' : 'inline-block';
    if (saveBtn) saveBtn.style.display = enabled ? 'inline-block' : 'none';
    if (cancelBtn) cancelBtn.style.display = enabled ? 'inline-block' : 'none';
}

async function saveProfile() {
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const reg_no = document.getElementById('profileRegNo').value.trim();
    const course = document.getElementById('profileCourse').value.trim();

    if (!name || !email || !reg_no || !course) {
        showNotification('Fill all profile fields before saving', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/students/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name, email, reg_no, course })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            showNotification(err?.error || 'Profile update failed', 'error');
            return;
        }

        const result = await response.json();
        currentStudent = result.user || currentStudent;
        populateProfileFields(currentStudent);
        setProfileEditing(false);
        showNotification('Profile updated successfully', 'success');
    } catch (err) {
        showNotification('Network error while updating profile', 'error');
    }
}

function initStudentHandlers() {
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');

    if (editBtn) editBtn.addEventListener('click', () => setProfileEditing(true));
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        populateProfileFields(currentStudent);
        setProfileEditing(false);
    });
    if (saveBtn) saveBtn.addEventListener('click', saveProfile);

    document.getElementById('reportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const attachment_id = document.getElementById('reportAttachmentId').value;
        const fileInput = document.getElementById('reportFile');
        if (!attachment_id || !fileInput?.files?.length) {
            showNotification('Select an attachment and report file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('attachment_id', attachment_id);
        formData.append('report', fileInput.files[0]);

        try {
            const response = await fetch(`${API_URL}/students/reports`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });

            if (!response.ok) {
                showNotification('Report upload failed', 'error');
                return;
            }

            showNotification('Report uploaded successfully', 'success');
            closeModal('reportModal');
            e.target.reset();
            loadStudentDashboard();
        } catch (err) {
            showNotification('Network error uploading report', 'error');
        }
    });

    document.getElementById('applyForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const company_id = document.getElementById('companyId').value;
        const start_date = document.getElementById('startDate').value;
        const end_date = document.getElementById('endDate').value;

        if (!company_id || !start_date || !end_date) {
            showNotification('Complete the attachment application form', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/students/apply-attachment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ company_id, start_date, end_date })
            });

            if (!response.ok) {
                showNotification('Attachment application failed', 'error');
                return;
            }

            showNotification('Attachment application submitted', 'success');
            closeModal('applyModal');
            loadStudentDashboard();
        } catch (err) {
            showNotification('Network error submitting application', 'error');
        }
    });

    document.getElementById('logbookForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const attachment_id = document.getElementById('attachmentId').value;
        const week_number = document.getElementById('weekNumber').value;
        const activities = document.getElementById('activities').value;
        const skills_learned = document.getElementById('skillsLearned').value;
        const challenges = document.getElementById('challenges').value;
        const mood_rating = document.getElementById('moodRating').value;

        if (!attachment_id || !week_number || !activities) {
            showNotification('Fill the required logbook fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/students/submit-logbook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ attachment_id, week_number, activities, skills_learned, challenges, mood_rating })
            });

            if (!response.ok) {
                showNotification('Logbook submission failed', 'error');
                return;
            }

            showNotification('Logbook submitted successfully', 'success');
            closeModal('logbookModal');
            e.target.reset();
            loadStudentDashboard();
        } catch (err) {
            showNotification('Network error submitting logbook', 'error');
        }
    });
}

function loadAttachments(attachments) {
    const table = document.getElementById('attachmentsTable');
    if (!table) return;
    table.innerHTML = '';

    if (!attachments || attachments.length === 0) {
        table.innerHTML = '<tr><td colspan="6">No attachments yet</td></tr>';
        return;
    }

    attachments.forEach(att => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${att.company_name || 'N/A'}</td>
            <td>${att.location || 'N/A'}</td>
            <td>${att.start_date || 'N/A'}</td>
            <td>${att.end_date || 'N/A'}</td>
            <td><span class="badge ${att.status || 'pending'}">${att.status || 'Pending'}</span></td>
            <td><button type="button" class="btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="viewAttachment(${att.id})">View</button></td>
        `;
        table.appendChild(row);
    });
}

function viewAttachment(id) {
    const att = studentAttachments.find(a => a.id === id);
    if (!att) {
        showNotification('Attachment not found', 'error');
        return;
    }

    const modal = document.getElementById('attachmentViewModal');
    if (!modal) return;
    modal.querySelector('.company').textContent = att.company_name || 'N/A';
    modal.querySelector('.location').textContent = att.location || 'N/A';
    modal.querySelector('.dates').textContent = `${att.start_date || ''} - ${att.end_date || ''}`;
    modal.querySelector('.status').textContent = att.status || 'N/A';
    showModal('attachmentViewModal');
}

window.viewAttachment = viewAttachment;
window.loadStudentDashboard = loadStudentDashboard;
window.initStudentHandlers = initStudentHandlers;
window.setProfileEditing = setProfileEditing;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadStudentDashboard();
        initStudentHandlers();
        setProfileEditing(false);
    });
} else {
    loadStudentDashboard();
    initStudentHandlers();
    setProfileEditing(false);
}
