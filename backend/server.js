const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const facultyRoutes = require('./routes/faculty');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);

// Route to serve login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Route to serve faculty.html
app.get('/faculty', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/faculty.html'));
});

// Route to serve student.html
app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/student.html'));
});

// Default: serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
