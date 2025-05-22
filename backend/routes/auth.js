const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// For student login
router.post('/student/login', authController.studentLogin);

module.exports = router;

