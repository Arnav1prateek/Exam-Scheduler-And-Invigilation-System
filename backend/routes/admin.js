const express = require('express');
const router = express.Router();
const { getTableData } = require('../controllers/adminController');

// Use explicit route for tables
router.get('/tables/:tableName', getTableData);

module.exports = router;