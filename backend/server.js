const express = require('express');
const pool = require('./db');
const app = express();

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
