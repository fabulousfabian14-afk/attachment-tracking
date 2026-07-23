const pool = require('../db');

(async () => {
  try {
    const res = await pool.query('SELECT id, email, name, role, reg_no, course, created_at FROM users ORDER BY id DESC LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Query error', err);
    process.exit(1);
  }
})();
