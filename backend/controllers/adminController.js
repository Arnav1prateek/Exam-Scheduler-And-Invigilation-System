const pool = require('../db');

const getTableData = async (req, res) => {
    const { tableName } = req.params;
    
    // Debug log
    console.log(`Requested table: ${tableName}`);
    
    try {
        const validTables = ['Student', 'Faculty', 'Exam', 'Room', 'Exam_Faculty'];
        if (!validTables.includes(tableName)) {
            console.log('Invalid table requested:', tableName);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid table name'
            });
        }
        
        const query = `SELECT * FROM ${tableName}`;
        console.log('Executing query:', query); // Debug log
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (err) {
        console.error('Database error:', {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            success: false,
            message: 'Database query failed',
            error: err.message
        });
    }
};

const getDepartmentExams = async (req, res) => {
    const { department } = req.query;

    try {
        const query = `
            SELECT e.*, r.room_no, r.building
            FROM Exam e
            LEFT JOIN Room r ON e.room_id = r.room_id
            WHERE e.department = $1
            ORDER BY e.date, e.start_time
        `;
        
        const result = await pool.query(query, [department]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching department exams' });
    }
};

module.exports = {
    getTableData,
    getDepartmentExams
};