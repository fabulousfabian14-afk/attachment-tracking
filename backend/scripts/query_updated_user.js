const pool = require('../db');

(async () => {
  try {
    const res = await pool.query(
      `SELECT id, email, name, role, reg_no, course, created_at, updated_at
       FROM users
       WHERE name ILIKE 'Signup Test Updated%'
       OR updated_at > NOW() - INTERVAL '10 minutes'
       ORDER BY updated_at DESC
       LIMIT 20`
    );
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Query error', err);
    process.exit(1);
  }
})();
