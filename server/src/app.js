const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const campusRoutes = require('./routes/campusRoutes');

const app = express();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", AI_SERVICE_URL]
        }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.security('CORS blocked request', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Enforce HTTPS in production
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

app.use(express.json({ limit: '10kb' }));

// Block known bad IPs and high-confidence bots
app.use((req, res, next) => {
    const ip = req.ip;

    if (rateLimiter.isBlocked(ip)) {
        logger.security('Blocked IP attempted access', { ip, path: req.path });
        return res.status(403).json({ error: 'Access denied. Your IP has been blocked due to suspicious activity.' });
    }

    const botCheck = rateLimiter.detectBot(req);
    if (botCheck.isBot && botCheck.confidence === 'high') {
        logger.security('Bot access blocked', { ip, path: req.path, reason: botCheck.reason });
        return res.status(403).json({ error: 'Automated access detected. Please use the application through a web browser.' });
    }

    next();
});

// Request logging
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('Request processed', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });
    next();
});

// API rate limiting
app.use((req, res, next) => {
    const result = rateLimiter.checkApiRateLimit(req.ip || req.connection.remoteAddress, req.path);
    if (!result.allowed) {
        return res.status(429).json({ error: result.reason, retryAfter: result.retryAfter });
    }
    next();
});

// Input sanitization — strip < > to prevent XSS
const sanitize = (str) => typeof str === 'string' ? str.replace(/[<>]/g, '').trim() : str;
const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key in obj) {
        obj[key] = typeof obj[key] === 'string' ? sanitize(obj[key]) : sanitizeObject(obj[key]);
    }
    return obj;
};
app.use((req, res, next) => { req.body = sanitizeObject(req.body); next(); });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'Campus Navigation Backend', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Smart Campus Backend API',
        version: '2.0.0',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            me: 'GET /api/auth/me',
            chat: 'POST /api/chat  — campus Q&A chatbot',
            campusLocations: 'GET /api/campus/locations',
            campusRoute: 'POST /api/campus/route',
            campusSearch: 'GET /api/campus/search?q=',
            customLocations: 'GET /api/locations',
            health: 'GET /health'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, path: req.path, method: req.method, ip: req.ip });
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
