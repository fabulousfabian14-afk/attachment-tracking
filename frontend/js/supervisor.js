// Supervisor specific functions
document.addEventListener('DOMContentLoaded', loadSupervisorDashboard);

// Keep evaluations in memory for view action
let supervisorEvaluations = [];

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
                <td><button onclick="openReviewModal(1)" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Review</button></td>
            </tr>
        `;
    }

    const evaluationsTable = document.getElementById('evaluationsTable');
    if (evaluationsTable) {
        supervisorEvaluations = [
            { id: 1, student: 'Amina Njeri', date: '2026-07-20', score: 8.8, professionalism: 9, technical_skills: 8, communication: 9, punctuality: 8, teamwork: 9, comments: 'Great progress', status: 'completed' }
        ];
        loadEvaluations(supervisorEvaluations);
    }
}

function loadEvaluations(evals) {
    const table = document.getElementById('evaluationsTable');
    table.innerHTML = '';
    if (!evals || evals.length === 0) {
        table.innerHTML = '<tr><td colspan="5">No evaluations yet</td></tr>';
        return;
    }

    evals.forEach(ev => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ev.student}</td>
            <td>${ev.date}</td>
            <td>${ev.score}/10</td>
            <td><span class="badge ${ev.status}">${ev.status}</span></td>
            <td><button onclick="viewEvaluation(${ev.id})" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">View</button></td>
        `;
        table.appendChild(row);
    });
}

function viewEvaluation(id) {
    const ev = supervisorEvaluations.find(e => e.id === id);
    if (!ev) return showNotification('Evaluation not found', 'error');

    const modal = document.getElementById('evaluationViewModal');
    if (!modal) return alert(`${ev.student} - ${ev.score}`);

    modal.querySelector('.eval-student').textContent = ev.student;
    modal.querySelector('.eval-score').textContent = `${ev.score}/10`;
    modal.querySelector('.eval-breakdown').textContent = `Professionalism: ${ev.professionalism}, Technical: ${ev.technical_skills}, Communication: ${ev.communication}, Punctuality: ${ev.punctuality}, Teamwork: ${ev.teamwork}`;
    modal.querySelector('.eval-comments').textContent = ev.comments || '';

    showModal('evaluationViewModal');
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
                <button onclick="openReviewModal(${student.attachment_id})" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Review</button>
            </td>
        `;
        table.appendChild(row);
    });
}

function openReviewModal(attachmentId) {
    sessionStorage.setItem('reviewAttachmentId', attachmentId);
    showModal('logbookReviewModal');
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
