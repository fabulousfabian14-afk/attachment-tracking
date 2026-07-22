const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get assigned students
router.get('/students', authenticateToken, authorizeRole('supervisor'), async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.course, a.id as attachment_id, a.status, c.name as company_name
       FROM users u
       INNER JOIN attachments a ON u.id = a.student_id
       WHERE a.supervisor_id = $1`,
      [supervisorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject logbook
router.put('/logbook/:logbook_id/approve', authenticateToken, authorizeRole('supervisor'), async (req, res) => {
  try {
    const { comments, status } = req.body;

    const result = await pool.query(
      `UPDATE logbooks SET status = $1, comments = $2, approved_by = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, comments, req.user.id, req.params.logbook_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Logbook not found' });
    }

    res.json({
      message: 'Logbook updated',
      logbook: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit evaluation
router.post('/submit-evaluation', authenticateToken, authorizeRole('supervisor'), async (req, res) => {
  try {
    const { attachment_id, professionalism, technical_skills, communication, punctuality, teamwork, comments } = req.body;

    const score = (professionalism + technical_skills + communication + punctuality + teamwork) / 5;

    const result = await pool.query(
      `INSERT INTO evaluations (attachment_id, evaluator_id, score, professionalism, technical_skills, communication, punctuality, teamwork, comments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [attachment_id, req.user.id, score, professionalism, technical_skills, communication, punctuality, teamwork, comments]
    );

    res.status(201).json({
      message: 'Evaluation submitted',
      evaluation: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
