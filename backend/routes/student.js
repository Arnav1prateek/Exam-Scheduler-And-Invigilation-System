const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Route to get student timetable
router.get('/:id', studentController.getTimetable);

// Route to change password
router.post('/change-password', studentController.changePassword);

module.exports = router;
