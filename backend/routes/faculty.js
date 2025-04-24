const express = require('express');
const router = express.Router();
const { 
  getFacultyExams,
  updateFacultyAvailability,
  updateExamAvailability
} = require('../controllers/facultyController');

// GET faculty details and exams
router.get('/:id', getFacultyExams);

// PUT update faculty availability
router.put('/:id/availability', updateFacultyAvailability);

// PUT update exam-specific availability
router.put('/exams/:examId/availability', updateExamAvailability);

module.exports = router;