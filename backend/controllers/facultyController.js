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
  
      // Get exams for Computing Technologies department along with availability status
      const examsQuery = await pool.query(`
        SELECT 
          e.exam_id,
          e.subject, 
          e.date, 
          e.start_time, 
          e.end_time, 
          r.room_no,
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
          is_available: exam.is_available || false
        }))
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching faculty data' });
    }
  };