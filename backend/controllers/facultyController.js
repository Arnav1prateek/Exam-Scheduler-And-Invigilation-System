const pool = require('../db');

const getFacultyExams = async (req, res) => {
  const { id } = req.params;

  try {
    const faculty = await pool.query(`SELECT department, availability_status FROM Faculty WHERE faculty_id = $1`, [id]);
    if (faculty.rows.length === 0) return res.status(404).json({ message: 'Faculty not found' });

    const { department, availability_status } = faculty.rows[0];

    const exams = await pool.query(`
      SELECT subject, date, start_time, end_time, r.room_no
      FROM Exam e
      LEFT JOIN Room r ON e.room_id = r.room_id
      WHERE e.department = $1
      ORDER BY e.date
    `, [department]);

    res.json({ availability_status, exams: exams.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching faculty exams' });
  }
};

module.exports = { getFacultyExams };
