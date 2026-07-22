// Lecturer specific functions
document.addEventListener('DOMContentLoaded', loadLecturerDashboard);

function renderDemoLecturerData() {
    document.getElementById('totalStudents').textContent = '18';
    document.getElementById('placedStudents').textContent = '15';
    document.getElementById('unplacedStudents').textContent = '3';
    document.getElementById('averageScore').textContent = '8.1';

    const demoStudents = [
        { name: 'Amina Njeri', course: 'Computer Science', company_name: 'Safaricom PLC', status: 'active', attachment_id: 1 },
        { name: 'Brian Otieno', course: 'Software Engineering', company_name: 'Microsoft Kenya', status: 'completed', attachment_id: 2 }
    ];
    loadStudentsForGrading(demoStudents);

    const visitsTable = document.getElementById('visitsTable');
    if (visitsTable) {
        visitsTable.innerHTML = `
            <tr>
                <td>Amina Njeri</td>
                <td>Safaricom PLC</td>
                <td>2026-07-25 10:00</td>
                <td><span class="badge approved">scheduled</span></td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
        `;
    }

    const gradingTable = document.getElementById('gradingTable');
    if (gradingTable) {
        gradingTable.innerHTML = `
            <tr>
                <td>Brian Otieno</td>
                <td>Microsoft Kenya</td>
                <td>2026-07-30</td>
                <td><span class="badge completed">completed</span></td>
                <td>A</td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button></td>
            </tr>
        `;
    }
}

async function loadLecturerDashboard() {
    try {
        const response = await fetch(`${API_URL}/lecturers/analytics`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const analytics = await response.json();
            document.getElementById('totalStudents').textContent = analytics.totalStudents;
            document.getElementById('placedStudents').textContent = analytics.placedStudents;
            document.getElementById('unplacedStudents').textContent = analytics.unplacedStudents;
            document.getElementById('averageScore').textContent = analytics.averageScore;
        } else {
            renderDemoLecturerData();
        }
    } catch (err) {
        renderDemoLecturerData();
    }

    try {
        const response = await fetch(`${API_URL}/lecturers/students`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const students = await response.json();
            loadStudentsForGrading(students);
        } else {
            renderDemoLecturerData();
        }
    } catch (err) {
        renderDemoLecturerData();
    }
}

function loadStudentsForGrading(students) {
    const table = document.getElementById('studentsTable');
    table.innerHTML = '';

    if (students.length === 0) {
        table.innerHTML = '<tr><td colspan="5">No students</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${student.company_name || 'N/A'}</td>
            <td><span class="badge ${student.status}">${student.status}</span></td>
            <td>
                <button onclick="gradeStudent(${student.attachment_id})" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Grade</button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Handle visit scheduling
document.getElementById('scheduleVisitForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attachment_id = document.getElementById('studentId').value;
    const visit_date = document.getElementById('visitDate').value;
    const observations = document.getElementById('observations').value;

    try {
        const response = await fetch(`${API_URL}/lecturers/schedule-visit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                attachment_id,
                visit_date,
                observations
            })
        });

        if (response.ok) {
            showNotification('Visit scheduled!', 'success');
            closeModal('scheduleVisitModal');
            e.target.reset();
        } else {
            showNotification('Failed to schedule visit', 'error');
        }
    } catch (err) {
        showNotification('Error scheduling visit', 'error');
    }
});

// Handle grading
document.getElementById('gradeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attachment_id = sessionStorage.getItem('gradeAttachmentId');
    const grade = document.getElementById('grade').value;
    const feedback = document.getElementById('gradeFeedback').value;

    try {
        const response = await fetch(`${API_URL}/lecturers/grade-student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                attachment_id,
                grade,
                feedback
            })
        });

        if (response.ok) {
            showNotification('Grade submitted!', 'success');
            closeModal('gradeModal');
            e.target.reset();
            loadLecturerDashboard();
        } else {
            showNotification('Failed to submit grade', 'error');
        }
    } catch (err) {
        showNotification('Error submitting grade', 'error');
    }
});

function gradeStudent(attachmentId) {
    sessionStorage.setItem('gradeAttachmentId', attachmentId);
    showModal('gradeModal');
}
