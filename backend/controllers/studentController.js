const pool = require('../db');

const getTimetable = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await pool.query(`SELECT department, semester FROM Student WHERE student_id = $1`, [id]);
    if (student.rows.length === 0) return res.status(404).json({ message: 'Student not found' });

    const { department, semester } = student.rows[0];

    const exams = await pool.query(`
      SELECT subject, date, start_time, end_time, r.room_no
      FROM Exam e
      LEFT JOIN Room r ON e.room_id = r.room_id
      WHERE e.department = $1 AND e.semester = $2
      ORDER BY e.date
    `, [department, semester]);

    res.json(exams.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching student exams' });
  }
};

module.exports = { getTimetable };
