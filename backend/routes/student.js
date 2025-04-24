const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Route to get student timetable
router.get('/:id', studentController.getTimetable);

module.exports = router;