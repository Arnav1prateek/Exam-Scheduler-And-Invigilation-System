const pool = require('../db');
const bcrypt = require('bcrypt');

// Student login with password
const studentLogin = async (req, res) => {
  const { id, password } = req.body;

  try {
    const studentResult = await pool.query('SELECT * FROM Student WHERE student_id = $1', [id]);

    if (studentResult.rows.length === 0) {
      return res.status(401).json({ message: 'Student not found' });
    }

    const student = studentResult.rows[0];

    // If password is null (first-time login), set it to a hash of the student ID
    if (!student.password) {
      const hashedPassword = await bcrypt.hash(student.student_id, 10);
      await pool.query('UPDATE Student SET password = $1 WHERE student_id = $2', [hashedPassword, id]);
      student.password = hashedPassword;
    }

    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Successful login
    res.status(200).json({
      message: 'Login successful',
      id: student.student_id,
      first_login: student.first_login,
      role: 'student'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { studentLogin };
