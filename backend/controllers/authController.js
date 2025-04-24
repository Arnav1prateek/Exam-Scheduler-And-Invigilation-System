const pool = require('../db');

const handleLogin = async (req, res) => {
  const { id } = req.body;

  try {
    // Check if student
    const studentResult = await pool.query(
      'SELECT * FROM students WHERE regno = $1',
      [id]
    );

    if (studentResult.rows.length > 0) {
      return res.json({ userType: 'student', data: studentResult.rows[0] });
    }

    // Check if teacher
    const teacherResult = await pool.query(
      'SELECT * FROM teachers WHERE staffid = $1',
      [id]
    );

    if (teacherResult.rows.length > 0) {
      return res.json({ userType: 'teacher', data: teacherResult.rows[0] });
    }

    // No match
    res.status(404).json({ message: 'ID not found' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { handleLogin };
