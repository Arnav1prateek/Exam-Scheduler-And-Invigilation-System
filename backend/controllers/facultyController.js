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

    // Get exams for Computing Technologies department with availability info
    const examsQuery = await pool.query(`
      SELECT 
        e.exam_id,
        e.subject, 
        e.date, 
        e.start_time, 
        e.end_time, 
        r.room_no,
        e.max_invigilators,
        (
          SELECT COUNT(*) 
          FROM Exam_Faculty ef 
          WHERE ef.exam_id = e.exam_id AND ef.assigned = true
        ) as assigned_count,
        EXISTS (
          SELECT 1 FROM Exam_Faculty 
          WHERE exam_id = e.exam_id 
          AND faculty_id = $1
          AND assigned = true
        ) as is_available
      FROM Exam e
      LEFT JOIN Room r ON e.room_id = r.room_id
      WHERE e.department = 'Computing Technologies'
      ORDER BY e.date, e.start_time
    `, [id]);

    res.json({
      faculty,
      exams: examsQuery.rows.map(exam => ({
        ...exam,
        is_available: exam.is_available || false,
        // Add whether exam is full (for frontend to disable toggle)
        is_full: exam.assigned_count >= (exam.max_invigilators || 2)
      }))
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

const updateExamAvailability = async (req, res) => {
  const { examId } = req.params;
  const { facultyId, isAvailable } = req.body;

  try {
    // Check current count of available invigilators for this exam
    const countQuery = await pool.query(`
      SELECT COUNT(*) 
      FROM Exam_Faculty 
      WHERE exam_id = $1 AND assigned = true
    `, [examId]);

    const currentCount = parseInt(countQuery.rows[0].count);
    const maxInvigilatorsQuery = await pool.query(`
      SELECT max_invigilators FROM Exam WHERE exam_id = $1
    `, [examId]);
    const maxInvigilators = maxInvigilatorsQuery.rows[0]?.max_invigilators || 2;

    if (isAvailable && currentCount >= maxInvigilators) {
      return res.status(400).json({ 
        success: false,
        message: `Maximum ${maxInvigilators} invigilators already assigned to this exam`,
        is_full: true
      });
    }

    if (isAvailable) {
      await pool.query(`
        INSERT INTO Exam_Faculty (exam_id, faculty_id, assigned)
        VALUES ($1, $2, $3)
        ON CONFLICT (exam_id, faculty_id) 
        DO UPDATE SET assigned = $3
      `, [examId, facultyId, isAvailable]);
    } else {
      await pool.query(`
        DELETE FROM Exam_Faculty 
        WHERE exam_id = $1 AND faculty_id = $2
      `, [examId, facultyId]);
    }

    res.json({ 
      success: true,
      is_full: isAvailable ? currentCount + 1 >= maxInvigilators : currentCount - 1 >= maxInvigilators
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating exam availability' });
  }
};

module.exports = { 
  getFacultyExams, 
  updateFacultyAvailability,
  updateExamAvailability 
};