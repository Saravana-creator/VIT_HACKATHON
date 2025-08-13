const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const credentialRoutes = require('./routes/credentials');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/credentials', credentialRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

app.get('/university', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/university.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/student.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 NFT Credential System running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and visit: http://localhost:${PORT}`);
});