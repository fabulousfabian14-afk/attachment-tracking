const express = require('express');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all students in department
router.get('/students', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.course, u.department, a.id as attachment_id, a.status, c.name as company_name, a.start_date
       FROM users u
       LEFT JOIN attachments a ON u.id = a.student_id
       WHERE u.role = 'student' AND u.department = $1`,
      [req.user.department]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Schedule visit
router.post('/schedule-visit', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const { attachment_id, visit_date, observations } = req.body;

    const result = await pool.query(
      `INSERT INTO visits (attachment_id, lecturer_id, visit_date, observations)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [attachment_id, req.user.id, visit_date, observations]
    );

    res.status(201).json({
      message: 'Visit scheduled',
      visit: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Grade student attachment
router.post('/grade-student', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const { attachment_id, grade, feedback } = req.body;

    const result = await pool.query(
      `UPDATE attachments SET status = 'completed' WHERE id = $1 RETURNING *`,
      [attachment_id]
    );

    await pool.query(
      `INSERT INTO reports (attachment_id, grade, feedback, graded_by, status)
       VALUES ($1, $2, $3, $4, 'completed')`,
      [attachment_id, grade, feedback, req.user.id]
    );

    res.json({
      message: 'Student graded',
      attachment: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics
router.get('/analytics', authenticateToken, authorizeRole('lecturer'), async (req, res) => {
  try {
    const totalStudents = await pool.query(
      'SELECT COUNT(*) FROM users WHERE role = $1 AND department = $2',
      ['student', req.user.department]
    );

    const placedStudents = await pool.query(
      `SELECT COUNT(DISTINCT a.student_id) FROM attachments a
       INNER JOIN users u ON a.student_id = u.id
       WHERE u.department = $1`,
      [req.user.department]
    );

    const averageScore = await pool.query(
      `SELECT AVG(score) as avg_score FROM evaluations e
       INNER JOIN attachments a ON e.attachment_id = a.id
       INNER JOIN users u ON a.student_id = u.id
       WHERE u.department = $1`,
      [req.user.department]
    );

    res.json({
      totalStudents: totalStudents.rows[0].count,
      placedStudents: placedStudents.rows[0].count,
      unplacedStudents: totalStudents.rows[0].count - placedStudents.rows[0].count,
      averageScore: parseFloat(averageScore.rows[0].avg_score || 0).toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
