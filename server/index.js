const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const db = require('./db');

// Falha rápido se segredos essenciais não estiverem configurados
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET não definido no .env. Abortando.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// CORS restrito por variável de ambiente. Ex.: CORS_ORIGIN=https://app.com,http://localhost:8085
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permite requests sem origin (apps mobile nativos, curl) e origens na allowlist.
        // Se CORS_ORIGIN não estiver definido, cai para modo aberto (útil em dev).
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

// Log de requisições só fora de produção
if (!isProd) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

app.use(express.json({ limit: '5mb' }));

// Rate limit específico para autenticação (anti brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

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

app.use('/api/auth', authLimiter, authRoutes);
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
