const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/auth');
const neighborhoodRoutes = require('./routes/neighborhoods');

app.use('/api/auth', authRoutes);
app.use('/api/neighborhoods', neighborhoodRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
