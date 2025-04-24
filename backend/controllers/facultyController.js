const pool = require('../db');

const getFacultyExams = async (req, res) => {
  const { id } = req.params;

  try {
    // Get faculty details
    const facultyQuery = await pool.query(`
      SELECT faculty_id as id, name, department, availability_status 
      FROM Faculty 
      WHERE faculty_id = $1
    `, [id]);
    
    if (facultyQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const faculty = facultyQuery.rows[0];

    // Get exams for faculty's department
    const examsQuery = await pool.query(`
      SELECT e.subject, e.date, e.start_time, e.end_time, r.room_no
      FROM Exam e
      LEFT JOIN Room r ON e.room_id = r.room_id
      WHERE e.department = $1
      ORDER BY e.date, e.start_time
    `, [faculty.department]);

    res.json({
      faculty,
      exams: examsQuery.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching faculty data' });
  }
};

const updateFacultyAvailability = async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  try {
    await pool.query(`
      UPDATE Faculty 
      SET availability_status = $1
      WHERE faculty_id = $2
    `, [availability, id]);

    res.json({ success: true, availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating availability' });
  }
};

module.exports = { getFacultyExams, updateFacultyAvailability };