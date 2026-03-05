const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use(express.json());

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/auth');
const neighborhoodRoutes = require('./routes/neighborhoods');
const dashboardRoutes = require('./routes/dashboard');
const shopRoutes = require('./routes/shops');
const adRoutes = require('./routes/ads');
const newsRoutes = require('./routes/news');
const contactsRoutes = require('./routes/contacts');
const adminRoutes = require('./routes/admin');
const ordersRoutes = require('./routes/orders');
const searchRoutes = require('./routes/search');

app.use('/api/auth', authRoutes);
app.use('/api/neighborhoods', neighborhoodRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);

// Catch-all route to serve the frontend for any non-API requests (SPA routing)
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
