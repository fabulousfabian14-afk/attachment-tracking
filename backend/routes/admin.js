const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all attachments
router.get('/attachments', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as student_name, u.email as student_email, c.name as company_name
       FROM attachments a
       INNER JOIN users u ON a.student_id = u.id
       LEFT JOIN companies c ON a.company_id = c.id
       ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject attachment
router.put('/attachments/:attachment_id/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE attachments SET status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, req.params.attachment_id]
    );

    res.json({
      message: 'Attachment status updated',
      attachment: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all companies
router.get('/companies', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add company
router.post('/companies', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { name, location, contact_person, contact_phone, contact_email, industry } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (name, location, contact_person, contact_phone, contact_email, industry)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, location, contact_person, contact_phone, contact_email, industry]
    );

    res.status(201).json({
      message: 'Company added',
      company: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics dashboard
router.get('/analytics', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const totalStudents = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'student'"
    );

    const placedStudents = await pool.query(
      'SELECT COUNT(DISTINCT student_id) FROM attachments WHERE status = $1',
      ['approved']
    );

    const totalCompanies = await pool.query('SELECT COUNT(*) FROM companies');

    const completedAttachments = await pool.query(
      'SELECT COUNT(*) FROM attachments WHERE status = $1',
      ['completed']
    );

    res.json({
      totalStudents: totalStudents.rows[0].count,
      placedStudents: placedStudents.rows[0].count,
      totalCompanies: totalCompanies.rows[0].count,
      completedAttachments: completedAttachments.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
