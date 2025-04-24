const express = require('express');
const router = express.Router();
const { getFacultyExams } = require('../controllers/facultyController');

// GET /api/faculty/:id
router.get('/:id', getFacultyExams);

module.exports = router;
