const pool = require('../db'); // Make sure this import is at the top

const getTimetable = async (req, res) => {
    const { id } = req.params;

    try {
        // Get complete student information
        const studentQuery = await pool.query(`
            SELECT student_id, first_name, last_name, email, department, academic_year, semester 
            FROM Student WHERE student_id = $1
        `, [id]);
        
        if (studentQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = studentQuery.rows[0];
        const { department, semester } = student;

        // Get exams for the student's department and semester
        const examsQuery = await pool.query(`
            SELECT exam_id, subject, date, start_time, end_time, r.room_no, e.department
            FROM Exam e
            LEFT JOIN Room r ON e.room_id = r.room_id
            WHERE e.department = $1 AND e.semester = $2
            ORDER BY e.date
        `, [department, semester]);

        res.json({
            student: {
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email,
                department: student.department,
                academic_year: student.academic_year,
                semester: student.semester
            },
            exams: examsQuery.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching student data' });
    }
};

// Make sure to export the function
module.exports = {
    getTimetable
};