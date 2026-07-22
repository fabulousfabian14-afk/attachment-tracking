// Admin specific functions
document.addEventListener('DOMContentLoaded', loadAdminDashboard);

function renderDemoAdminData() {
    document.getElementById('totalStudents').textContent = '24';
    document.getElementById('placedStudents').textContent = '19';
    document.getElementById('totalCompanies').textContent = '8';
    document.getElementById('completedAttachments').textContent = '12';

    const attachmentsTable = document.getElementById('attachmentsTable');
    if (attachmentsTable) {
        attachmentsTable.innerHTML = `
            <tr>
                <td>Amina Njeri</td>
                <td>Safaricom PLC</td>
                <td>2026-07-01</td>
                <td><span class="badge approved">approved</span></td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Review</button></td>
            </tr>
        `;
    }

    const companiesTable = document.getElementById('companiesTable');
    if (companiesTable) {
        companiesTable.innerHTML = `
            <tr>
                <td>Safaricom PLC</td>
                <td>Nairobi</td>
                <td>Jane Wanjiku</td>
                <td>hr@safaricom.co.ke</td>
                <td><button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
        `;
    }
}

async function loadAdminDashboard() {
    try {
        const response = await fetch(`${API_URL}/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (response.ok) {
            const analytics = await response.json();
            document.getElementById('totalStudents').textContent = analytics.totalStudents;
            document.getElementById('placedStudents').textContent = analytics.placedStudents;
            document.getElementById('totalCompanies').textContent = analytics.totalCompanies;
            document.getElementById('completedAttachments').textContent = analytics.completedAttachments;
            loadAttachments();
            loadCompanies();
        } else {
            renderDemoAdminData();
        }
    } catch (err) {
        renderDemoAdminData();
    }
}

async function loadAttachments() {
    try {
        const response = await fetch(`${API_URL}/admin/attachments`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const attachments = await response.json();

        if (response.ok) {
            const table = document.getElementById('attachmentsTable');
            table.innerHTML = '';

            if (attachments.length === 0) {
                table.innerHTML = '<tr><td colspan="5">No attachments</td></tr>';
                return;
            }

            attachments.forEach(att => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${att.student_name}</td>
                    <td>${att.company_name || 'N/A'}</td>
                    <td>${att.start_date}</td>
                    <td><span class="badge ${att.status}">${att.status}</span></td>
                    <td>
                        ${att.status === 'pending' ? `
                            <button onclick="approveAttachment(${att.id}, 'approved')" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Approve</button>
                            <button onclick="approveAttachment(${att.id}, 'rejected')" style="padding: 6px 12px; font-size: 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Reject</button>
                        ` : 'N/A'}
                    </td>
                `;
                table.appendChild(row);
            });
        }
    } catch (err) {
        console.error('Error loading attachments:', err);
    }
}

async function loadCompanies() {
    try {
        const response = await fetch(`${API_URL}/admin/companies`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const companies = await response.json();

        if (response.ok) {
            // Populate dropdown
            const select = document.getElementById('companyId');
            if (select) {
                select.innerHTML = '<option value="">Select Company</option>';
                companies.forEach(company => {
                    select.innerHTML += `<option value="${company.id}">${company.name}</option>`;
                });
            }

            // Populate table
            const table = document.getElementById('companiesTable');
            if (table) {
                table.innerHTML = '';

                companies.forEach(company => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${company.name}</td>
                        <td>${company.location}</td>
                        <td>${company.contact_person}</td>
                        <td>${company.contact_email}</td>
                        <td><button onclick="editCompany(${company.id})" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
                    `;
                    table.appendChild(row);
                });
            }
        }
    } catch (err) {
        console.error('Error loading companies:', err);
    }
}

// Handle add company
document.getElementById('addCompanyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('companyName').value;
    const location = document.getElementById('companyLocation').value;
    const contact_person = document.getElementById('companyContact').value;
    const contact_email = document.getElementById('companyEmail').value;
    const contact_phone = document.getElementById('companyPhone').value;
    const industry = document.getElementById('companyIndustry').value;

    try {
        const response = await fetch(`${API_URL}/admin/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                name,
                location,
                contact_person,
                contact_email,
                contact_phone,
                industry
            })
        });

        if (response.ok) {
            showNotification('Company added successfully!', 'success');
            closeModal('addCompanyModal');
            e.target.reset();
            loadCompanies();
        } else {
            showNotification('Failed to add company', 'error');
        }
    } catch (err) {
        showNotification('Error adding company', 'error');
    }
});

async function approveAttachment(attachmentId, status) {
    try {
        const response = await fetch(`${API_URL}/admin/attachments/${attachmentId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showNotification(`Attachment ${status}!`, 'success');
            loadAttachments();
        } else {
            showNotification('Failed to update attachment', 'error');
        }
    } catch (err) {
        showNotification('Error updating attachment', 'error');
    }
}
