const express = require('express');
const router = express.Router();
const { 
  getFacultyExams,
  updateFacultyAvailability
} = require('../controllers/facultyController');

// GET faculty details and exams
router.get('/:id', getFacultyExams);

// PUT update faculty availability
router.put('/:id/availability', updateFacultyAvailability);

module.exports = router;