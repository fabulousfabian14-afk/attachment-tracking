// Supervisor specific functions
document.addEventListener('DOMContentLoaded', loadSupervisorDashboard);

function renderDemoSupervisorData() {
    document.getElementById('assignedStudents').textContent = '3';
    document.getElementById('pendingLogbooks').textContent = '1';
    document.getElementById('evaluationsDone').textContent = '2';

    const demoStudents = [
        { name: 'Amina Njeri', email: 'amina@example.com', course: 'Computer Science', status: 'active', attachment_id: 1 },
        { name: 'Brian Otieno', email: 'brian@example.com', course: 'Software Engineering', status: 'active', attachment_id: 2 }
    ];
    loadStudentsTable(demoStudents);

    const logbooksTable = document.getElementById('logbooksTable');
    if (logbooksTable) {
        logbooksTable.innerHTML = `
            <tr>
                <td>Amina Njeri</td>
                <td>Week 2</td>
                <td>2026-07-16</td>
                <td><span class="badge pending">pending</span></td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Review</button></td>
            </tr>
        `;
    }

    const evaluationsTable = document.getElementById('evaluationsTable');
    if (evaluationsTable) {
        evaluationsTable.innerHTML = `
            <tr>
                <td>Amina Njeri</td>
                <td>2026-07-20</td>
                <td>8.8/10</td>
                <td><span class="badge approved">completed</span></td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button></td>
            </tr>
        `;
    }
}

async function loadSupervisorDashboard() {
    try {
        const response = await fetch(`${API_URL}/supervisors/students`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const students = await response.json();
            document.getElementById('assignedStudents').textContent = students.length;
            loadStudentsTable(students);
        } else {
            renderDemoSupervisorData();
        }
    } catch (err) {
        renderDemoSupervisorData();
    }
}

function loadStudentsTable(students) {
    const table = document.getElementById('studentsTable');
    table.innerHTML = '';

    if (students.length === 0) {
        table.innerHTML = '<tr><td colspan="5">No assigned students</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td><span class="badge ${student.status}">${student.status}</span></td>
            <td>
                <button onclick="reviewStudent(${student.attachment_id})" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Review</button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Handle evaluation submission
document.getElementById('evaluationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attachment_id = document.getElementById('studentId').value;
    const professionalism = parseInt(document.getElementById('professionalism').value);
    const technical_skills = parseInt(document.getElementById('technicalSkills').value);
    const communication = parseInt(document.getElementById('communication').value);
    const punctuality = parseInt(document.getElementById('punctuality').value);
    const teamwork = parseInt(document.getElementById('teamwork').value);
    const comments = document.getElementById('evalComments').value;

    try {
        const response = await fetch(`${API_URL}/supervisors/submit-evaluation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                attachment_id,
                professionalism,
                technical_skills,
                communication,
                punctuality,
                teamwork,
                comments
            })
        });

        if (response.ok) {
            showNotification('Evaluation submitted!', 'success');
            closeModal('evaluationModal');
            e.target.reset();
        } else {
            showNotification('Failed to submit evaluation', 'error');
        }
    } catch (err) {
        showNotification('Error submitting evaluation', 'error');
    }
});
