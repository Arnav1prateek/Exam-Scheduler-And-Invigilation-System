const express = require('express');
const router = express.Router();
const { getTimetable } = require('../controllers/studentController');

// GET /api/student/:id
router.get('/:id', getTimetable);

module.exports = router;
