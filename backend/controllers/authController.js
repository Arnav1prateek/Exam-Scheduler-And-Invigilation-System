const pool = require('../db');

const login = async (req, res) => {
  const { id } = req.body;

  try {
    const studentResult = await pool.query(`SELECT * FROM Student WHERE student_id = $1`, [id]);

    if (studentResult.rows.length > 0) {
      return res.json({ role: 'student', id });
    }

    const facultyResult = await pool.query(`SELECT * FROM Faculty WHERE faculty_id = $1`, [id]);

    if (facultyResult.rows.length > 0) {
      return res.json({ role: 'faculty', id });
    }

    return res.status(404).json({ message: 'User not found' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error' });
  }
};

module.exports = { login };
