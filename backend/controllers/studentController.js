const pool = require('../db');
const bcrypt = require('bcrypt');

const getTimetable = async (req, res) => {
    const { id } = req.params;

    try {
        const studentQuery = await pool.query(`
            SELECT student_id, first_name, last_name, email, department, academic_year, semester 
            FROM Student WHERE student_id = $1
        `, [id]);

        if (studentQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = studentQuery.rows[0];
        const { department, semester } = student;

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

// NEW: Change password function
const changePassword = async (req, res) => {
    const { id, password } = req.body; // ✅ FIXED name

    console.log("Received in changePassword:", { id, password });

    if (!id || !password) {
        return res.status(400).json({ message: 'ID and password required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'UPDATE Student SET password = $1, first_login = false WHERE student_id = $2',
            [hashedPassword, id]
        );

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTimetable,
    changePassword
};
