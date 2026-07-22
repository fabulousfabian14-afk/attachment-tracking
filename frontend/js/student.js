// Student specific functions
document.addEventListener('DOMContentLoaded', loadStudentDashboard);

function renderDemoStudentData() {
    document.getElementById('activeAttachments').textContent = '1';
    document.getElementById('logbookCount').textContent = '4';
    document.getElementById('pendingCount').textContent = '1';

    const demoAttachments = [
        { id: 1, company_name: 'Safaricom PLC', location: 'Nairobi', start_date: '2026-07-01', end_date: '2026-09-30', status: 'approved' }
    ];
    loadAttachments(demoAttachments);

    const demoLogbooks = [
        { id: 1, week_number: 'Week 1', activities: 'Configured test environment and shadowed support team', status: 'approved', submitted_date: '2026-07-08' },

    // Keep the latest attachments in memory for view actions
    let studentAttachments = [];
    let currentStudent = null;

        { id: 2, week_number: 'Week 2', activities: 'Built API test scripts and documented issues', status: 'pending', submitted_date: '2026-07-15' }
    ];
    const logbooksTable = document.getElementById('logbooksTable');
    if (logbooksTable) {
        logbooksTable.innerHTML = demoLogbooks.map(item => `
            <tr>
                <td>${item.week_number}</td>
                <td>${item.activities}</td>
                <td><span class="badge ${item.status}">${item.status}</span></td>
                <td>${item.submitted_date}</td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button></td>
                studentAttachments = data.attachments || [];
                loadAttachments(studentAttachments);
        `).join('');
    }

    const evaluationsTable = document.getElementById('evaluationsTable');
    if (evaluationsTable) {
        evaluationsTable.innerHTML = `
            <tr>
                <td>Mr. Otieno</td>
                <td>2026-07-20</td>
                <td>8.7/10</td>
                <td>Excellent progress and communication</td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Open</button></td>
            </tr>
        `;
    }
}

async function loadStudentDashboard() {
    try {
        const response = await fetch(`${API_URL}/students/dashboard`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('activeAttachments').textContent = data.attachments.length;
            document.getElementById('logbookCount').textContent = data.logbookCount;
            document.getElementById('pendingCount').textContent = data.pendingLogbooks;
            loadAttachments(data.attachments);

        // set demo attachments into memory
        studentAttachments = demoAttachments;
        loadAttachments(studentAttachments);
            if (data.student) {
                document.getElementById('profileName').value = data.student.name || '';
                document.getElementById('profileEmail').value = data.student.email || '';
                document.getElementById('profileRegNo').value = data.student.reg_no || '';
                document.getElementById('profileCourse').value = data.student.course || '';
            }

            // Populate report attachment select
            const reportSelect = document.getElementById('reportAttachmentId');
            if (reportSelect) {
                reportSelect.innerHTML = '<option value="">Select Attachment</option>' + data.attachments.map(a => `<option value="${a.id}">${a.company_name || 'N/A'} (${a.start_date} - ${a.end_date})</option>`).join('');
            }
        } else {
            renderDemoStudentData();
        }
    } catch (err) {
        renderDemoStudentData();
    }
}

// Handle report upload
document.getElementById('reportForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attachment_id = document.getElementById('reportAttachmentId').value;
    const fileInput = document.getElementById('reportFile');
    if (!attachment_id || !fileInput.files.length) {
        showNotification('Select attachment and file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('attachment_id', attachment_id);
    formData.append('report', fileInput.files[0]);

    try {
        const response = await fetch(`${API_URL}/students/reports`, {
            method: 'POST',
            // Student specific functions
            document.addEventListener('DOMContentLoaded', loadStudentDashboard);

            // Keep the latest attachments in memory for view actions
            let studentAttachments = [];

            function renderDemoStudentData() {
                document.getElementById('activeAttachments').textContent = '1';
                document.getElementById('logbookCount').textContent = '4';
                document.getElementById('pendingCount').textContent = '1';

                const demoAttachments = [
                    { id: 1, company_name: 'Safaricom PLC', location: 'Nairobi', start_date: '2026-07-01', end_date: '2026-09-30', status: 'approved' }
                ];
                studentAttachments = demoAttachments;
                loadAttachments(studentAttachments);

                const demoLogbooks = [
                    { id: 1, week_number: 'Week 1', activities: 'Configured test environment and shadowed support team', status: 'approved', submitted_date: '2026-07-08' },
                    { id: 2, week_number: 'Week 2', activities: 'Built API test scripts and documented issues', status: 'pending', submitted_date: '2026-07-15' }
                ];
                const logbooksTable = document.getElementById('logbooksTable');
                if (logbooksTable) {
                    logbooksTable.innerHTML = demoLogbooks.map(item => `
                        <tr>
                            <td>${item.week_number}</td>
                            <td>${item.activities}</td>
                            <td><span class="badge ${item.status}">${item.status}</span></td>
                            <td>${item.submitted_date}</td>
                            <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button></td>
                        </tr>
                    `).join('');
                }

                const evaluationsTable = document.getElementById('evaluationsTable');
                if (evaluationsTable) {
                    evaluationsTable.innerHTML = `
                        <tr>
                            <td>Mr. Otieno</td>
                            <td>2026-07-20</td>
                            <td>8.7/10</td>
                            <td>Excellent progress and communication</td>
                            <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Open</button></td>
                        </tr>
                    `;
                }
            }

            async function loadStudentDashboard() {
                try {
                    const response = await fetch(`${API_URL}/students/dashboard`, {
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        document.getElementById('activeAttachments').textContent = data.attachments.length;
                        document.getElementById('logbookCount').textContent = data.logbookCount;
                        document.getElementById('pendingCount').textContent = data.pendingLogbooks;
                            studentAttachments = data.attachments || [];
                            currentStudent = data.student || null;
                            populateProfileFields(currentStudent);
                        loadAttachments(studentAttachments);

                        // Populate profile fields
                        if (data.student) {
                            document.getElementById('profileName').value = data.student.name || '';
                            document.getElementById('profileEmail').value = data.student.email || '';
                            document.getElementById('profileRegNo').value = data.student.reg_no || '';
                            document.getElementById('profileCourse').value = data.student.course || '';
                        }

                        // Populate report attachment select
                        const reportSelect = document.getElementById('reportAttachmentId');
                        if (reportSelect) {
                            reportSelect.innerHTML = '<option value="">Select Attachment</option>' + studentAttachments.map(a => `<option value="${a.id}">${a.company_name || 'N/A'} (${a.start_date} - ${a.end_date})</option>`).join('');
                        }
                    } else {
                        renderDemoStudentData();
                    }
                } catch (err) {
                    renderDemoStudentData();
                }
            }

            function populateProfileFields(student) {
                if (!student) return;
                document.getElementById('profileName').value = student.name || '';
                document.getElementById('profileEmail').value = student.email || '';
                document.getElementById('profileRegNo').value = student.reg_no || '';
                document.getElementById('profileCourse').value = student.course || '';
            }

            // Profile edit handlers
            document.getElementById('editProfileBtn')?.addEventListener('click', (e) => {
                document.getElementById('profileName').disabled = false;
                document.getElementById('profileEmail').disabled = false;
                document.getElementById('profileRegNo').disabled = false;
                document.getElementById('profileCourse').disabled = false;
                document.getElementById('editProfileBtn').style.display = 'none';
                document.getElementById('saveProfileBtn').style.display = 'inline-block';
                document.getElementById('cancelProfileBtn').style.display = 'inline-block';
            });

            document.getElementById('cancelProfileBtn')?.addEventListener('click', (e) => {
                // revert to currentStudent
                populateProfileFields(currentStudent);
                document.getElementById('profileName').disabled = true;
                document.getElementById('profileEmail').disabled = true;
                document.getElementById('profileRegNo').disabled = true;
                document.getElementById('profileCourse').disabled = true;
                document.getElementById('editProfileBtn').style.display = 'inline-block';
                document.getElementById('saveProfileBtn').style.display = 'none';
                document.getElementById('cancelProfileBtn').style.display = 'none';
            });

            document.getElementById('saveProfileBtn')?.addEventListener('click', async (e) => {
                const name = document.getElementById('profileName').value;
                const email = document.getElementById('profileEmail').value;
                const reg_no = document.getElementById('profileRegNo').value;
                const course = document.getElementById('profileCourse').value;

                try {
                    const response = await fetch(`${API_URL}/students/profile`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({ name, email, reg_no, course })
                    });

                    if (response.ok) {
                        const res = await response.json();
                        currentStudent = res.user;
                        populateProfileFields(currentStudent);
                        showNotification('Profile updated!', 'success');
                        // disable fields
                        document.getElementById('profileName').disabled = true;
                        document.getElementById('profileEmail').disabled = true;
                        document.getElementById('profileRegNo').disabled = true;
                        document.getElementById('profileCourse').disabled = true;
                        document.getElementById('editProfileBtn').style.display = 'inline-block';
                        document.getElementById('saveProfileBtn').style.display = 'none';
                        document.getElementById('cancelProfileBtn').style.display = 'none';
                    } else {
                        showNotification('Failed to update profile', 'error');
                    }
                } catch (err) {
                    showNotification('Error updating profile', 'error');
                }
            });

            // Handle report upload
            document.getElementById('reportForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const attachment_id = document.getElementById('reportAttachmentId').value;
                const fileInput = document.getElementById('reportFile');
                if (!attachment_id || !fileInput.files.length) {
                    showNotification('Select attachment and file', 'error');
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

                    if (response.ok) {
                        showNotification('Report uploaded!', 'success');
                        closeModal('reportModal');
                        e.target.reset();
                        loadStudentDashboard();
                    } else {
                        showNotification('Failed to upload report', 'error');
                    }
                } catch (err) {
                    showNotification('Error uploading report', 'error');
                }
            });

            function loadAttachments(attachments) {
                const table = document.getElementById('attachmentsTable');
                table.innerHTML = '';

                if (attachments.length === 0) {
                    table.innerHTML = '<tr><td colspan="6">No attachments yet</td></tr>';
                    return;
                }

                attachments.forEach(att => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${att.company_name || 'N/A'}</td>
                        <td>${att.location || 'N/A'}</td>
                        <td>${att.start_date}</td>
                        <td>${att.end_date}</td>
                        <td><span class="badge ${att.status}">${att.status}</span></td>
                        <td><button onclick="viewAttachment(${att.id})" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button></td>
                    `;
                    table.appendChild(row);
                });
            }

            // Handle attachment application
            document.getElementById('applyForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const company_id = document.getElementById('companyId').value;
                const start_date = document.getElementById('startDate').value;
                const end_date = document.getElementById('endDate').value;

                try {
                    const response = await fetch(`${API_URL}/students/apply-attachment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({ company_id, start_date, end_date })
                    });

                    if (response.ok) {
                        showNotification('Attachment application submitted!', 'success');
                        closeModal('applyModal');
                        loadStudentDashboard();
                    } else {
                        showNotification('Failed to submit application', 'error');
                    }
                } catch (err) {
                    showNotification('Error submitting application', 'error');
                }
            });

            // Handle logbook submission
            document.getElementById('logbookForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const attachment_id = document.getElementById('attachmentId').value;
                const week_number = document.getElementById('weekNumber').value;
                const activities = document.getElementById('activities').value;
                const skills_learned = document.getElementById('skillsLearned').value;
                const challenges = document.getElementById('challenges').value;
                const mood_rating = document.getElementById('moodRating').value;

                try {
                    const response = await fetch(`${API_URL}/students/submit-logbook`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({
                            attachment_id,
                            week_number,
                            activities,
                            skills_learned,
                            challenges,
                            mood_rating
                        })
                    });

                    if (response.ok) {
                        showNotification('Logbook submitted successfully!', 'success');
                        closeModal('logbookModal');
                        e.target.reset();
                    } else {
                        showNotification('Failed to submit logbook', 'error');
                    }
                } catch (err) {
                    showNotification('Error submitting logbook', 'error');
                }
            });

            // View an attachment in a modal
            function viewAttachment(id) {
                const att = studentAttachments.find(a => a.id === id);
                if (!att) return showNotification('Attachment not found', 'error');

                const modal = document.getElementById('attachmentViewModal');
                if (!modal) return alert(`Attachment: ${att.company_name} (${att.start_date} - ${att.end_date})`);

                modal.querySelector('.company').textContent = att.company_name || 'N/A';
                modal.querySelector('.location').textContent = att.location || 'N/A';
                modal.querySelector('.dates').textContent = `${att.start_date} - ${att.end_date}`;
                modal.querySelector('.status').textContent = att.status || 'N/A';

                showModal('attachmentViewModal');
            }
