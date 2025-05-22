const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Student profile routes
router.route('/:id')
    .get(studentController.getTimetable);

// Password change route
router.route('/change_password')
    .post(studentController.changePassword);

module.exports = router;