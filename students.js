const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get student dashboard
router.get('/dashboard', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student info
    const student = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    // Get attachments
    const attachments = await pool.query(
      `SELECT a.*, c.name as company_name, c.location, u.name as supervisor_name
       FROM attachments a
       LEFT JOIN companies c ON a.company_id = c.id
       LEFT JOIN users u ON a.supervisor_id = u.id
       WHERE a.student_id = $1`,
      [userId]
    );

    // Get logbook entries
    const logbooks = await pool.query(
      `SELECT l.* FROM logbooks l
       INNER JOIN attachments a ON l.attachment_id = a.id
       WHERE a.student_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );

    res.json({
      student: student.rows[0],
      attachments: attachments.rows,
      logbookCount: logbooks.rows.length,
      pendingLogbooks: logbooks.rows.filter(l => l.status === 'pending').length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit attachment application
router.post('/apply-attachment', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { company_id, start_date, end_date, supervisor_name } = req.body;
    const student_id = req.user.id;

    const result = await pool.query(
      `INSERT INTO attachments (student_id, company_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [student_id, company_id, start_date, end_date]
    );

    res.status(201).json({
      message: 'Attachment application submitted',
      attachment: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit logbook entry
router.post('/submit-logbook', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { attachment_id, week_number, activities, skills_learned, challenges, mood_rating } = req.body;

    // Verify student owns this attachment
    const attachment = await pool.query(
      'SELECT * FROM attachments WHERE id = $1 AND student_id = $2',
      [attachment_id, req.user.id]
    );

    if (attachment.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO logbooks (attachment_id, week_number, activities, skills_learned, challenges, mood_rating, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [attachment_id, week_number, activities, skills_learned, challenges, mood_rating]
    );

    res.status(201).json({
      message: 'Logbook entry submitted',
      logbook: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get logbook entries for a student
router.get('/logbooks/:attachment_id', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM logbooks WHERE attachment_id = $1 ORDER BY week_number`,
      [req.params.attachment_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
