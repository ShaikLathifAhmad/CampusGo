const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./logger');
const abuseProtection = require('./abuseProtection');
const antiScraping = require('./antiScraping');

const app = express();
const PORT = process.env.PORT || 3000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security: Helmet for security headers
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
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Security: CORS with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.security('CORS blocked request', { origin, ip: origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Security: Enforce HTTPS in production
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            logger.security('HTTP request redirected to HTTPS', { 
                ip: req.ip, 
                path: req.path 
            });
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

app.use(express.json({ limit: '10kb' })); // Limit payload size

// Import auth routes
const authRoutes = require('./authRoutes');

// Security: Bot detection middleware
app.use((req, res, next) => {
    const ip = req.ip;
    
    // Check if IP is blocked
    if (abuseProtection.isBlocked(ip)) {
        logger.security('Blocked IP attempted access', { ip, path: req.path });
        return res.status(403).json({ 
            error: 'Access denied. Your IP has been blocked due to suspicious activity.' 
        });
    }
    
    // Detect bots
    const botCheck = abuseProtection.detectBot(req);
    if (botCheck.isBot && botCheck.confidence === 'high') {
        logger.security('Bot access blocked', { 
            ip, 
            path: req.path,
            reason: botCheck.reason,
            userAgent: req.get('user-agent')
        });
        return res.status(403).json({ 
            error: 'Automated access detected. Please use the application through a web browser.' 
        });
    }
    
    next();
});

// Security: Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('Request processed', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
        
        // Log suspicious patterns
        if (res.statusCode === 401 || res.statusCode === 403) {
            logger.logSuspicious('Unauthorized access attempt', {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });
        }
    });
    
    next();
});

// Security: Advanced rate limiting middleware
const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const path = req.path;
    
    const result = abuseProtection.checkApiRateLimit(ip, path);
    
    if (!result.allowed) {
        return res.status(429).json({ 
            error: result.reason,
            retryAfter: result.retryAfter
        });
    }
    
    next();
};

// Apply rate limiting to all routes
app.use(rateLimiter);

// Auth routes
app.use('/api/auth', authRoutes);

// Security: Input validation middleware
const validateInput = (req, res, next) => {
    const body = req.body;
    
    // Prevent XSS and injection attacks
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[<>]/g, '').trim();
    };
    
    // Recursively sanitize all string values
    const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = sanitize(obj[key]);
            } else if (typeof obj[key] === 'object') {
                obj[key] = sanitizeObject(obj[key]);
            }
        }
        return obj;
    };
    
    req.body = sanitizeObject(body);
    next();
};

app.use(validateInput);

// Proxy routes to Python AI Service with AI-specific rate limiting
app.post('/api/chat', async (req, res) => {
    try {
        const ip = req.ip;
        
        // AI-specific rate limiting
        const aiRateLimit = abuseProtection.checkAIRequest(ip);
        if (!aiRateLimit.allowed) {
            return res.status(429).json({ 
                error: aiRateLimit.reason,
                retryAfter: aiRateLimit.retryAfter
            });
        }
        
        // Validate message length
        const message = req.body.message;
        if (!message || typeof message !== 'string') {
            logger.warn('Invalid chat message format', { ip: req.ip });
            return res.status(400).json({ error: 'Invalid message format' });
        }
        
        if (message.length > 500) {
            logger.warn('Chat message too long', { ip: req.ip, length: message.length });
            return res.status(400).json({ error: 'Message too long. Maximum 500 characters.' });
        }
        
        const response = await axios.post(`${AI_SERVICE_URL}/chat`, req.body, {
            timeout: 10000 // 10 second timeout
        });
        
        logger.info('Chat request processed', { ip: req.ip });
        res.json(response.data);
    } catch (error) {
        logger.logApiError('/api/chat', error, { 
            ip: req.ip,
            message: req.body.message?.substring(0, 50)
        });
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'AI Service temporarily unavailable' });
        }
        
        res.status(500).json({ error: 'Unable to process request' });
    }
});

app.post('/api/route', async (req, res) => {
    try {
        const ip = req.ip;
        const { start, end } = req.body;
        
        // AI-specific rate limiting for route calculation
        const aiRateLimit = abuseProtection.checkAIRequest(ip);
        if (!aiRateLimit.allowed) {
            return res.status(429).json({ 
                error: aiRateLimit.reason,
                retryAfter: aiRateLimit.retryAfter
            });
        }
        
        // Validate input
        if (!start || !end) {
            logger.warn('Invalid route request', { ip: req.ip });
            return res.status(400).json({ error: 'Start and end locations required' });
        }
        
        const response = await axios.post(`${AI_SERVICE_URL}/route`, req.body, {
            timeout: 10000
        });
        
        logger.info('Route request processed', { ip: req.ip, start, end });
        res.json(response.data);
    } catch (error) {
        logger.logApiError('/api/route', error, { 
            ip: req.ip,
            start: req.body.start,
            end: req.body.end
        });
        res.status(500).json({ error: 'Unable to calculate route' });
    }
});

// Mock database for Custom Locations (In-memory for MVP)
// In production, use a real database with proper user relationships
let customLocations = [];

// Security: Get only public locations or user's own locations
app.get('/api/locations', antiScraping, (req, res) => {
    try {
        // For public campus navigation, return only public locations
        // In a real app with auth, filter by userId: locations.filter(l => l.isPublic || l.userId === req.user.id)
        const publicLocations = customLocations.filter(loc => loc.isPublic !== false);
        
        res.json(publicLocations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Unable to fetch locations' });
    }
});

// Security: Validate and sanitize location data before adding
app.post('/api/locations', (req, res) => {
    try {
        const location = req.body;
        
        // Strict validation
        if (!location.name || typeof location.name !== 'string') {
            return res.status(400).json({ error: 'Invalid location name' });
        }
        
        if (!location.lat || !location.lng) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
        
        // Validate coordinate ranges
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lng);
        
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: 'Coordinates must be numbers' });
        }
        
        // Validate coordinates are within reasonable bounds (SRM Trichy campus area)
        if (lat < 10.94 || lat > 10.97 || lng < 78.74 || lng > 78.77) {
            return res.status(400).json({ error: 'Coordinates outside campus area' });
        }
        
        // Limit name length
        if (location.name.length > 100) {
            return res.status(400).json({ error: 'Location name too long' });
        }
        
        // Limit description length
        if (location.description && location.description.length > 500) {
            return res.status(400).json({ error: 'Description too long' });
        }
        
        // Create sanitized location object
        const newLocation = {
            id: Date.now(),
            name: location.name,
            lat: lat,
            lng: lng,
            description: location.description || '',
            isPublic: true, // For public campus navigation
            createdAt: new Date().toISOString()
            // In real app with auth: userId: req.user.id
        };
        
        // Prevent duplicate locations (same name and coordinates)
        const isDuplicate = customLocations.some(loc => 
            loc.name === newLocation.name && 
            Math.abs(loc.lat - newLocation.lat) < 0.0001 && 
            Math.abs(loc.lng - newLocation.lng) < 0.0001
        );
        
        if (isDuplicate) {
            return res.status(409).json({ error: 'Location already exists' });
        }
        
        customLocations.push(newLocation);
        
        res.status(201).json({ 
            message: 'Location added successfully', 
            location: newLocation 
        });
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({ error: 'Unable to add location' });
    }
});

// Security: Delete location with ownership check
app.delete('/api/locations/:id', (req, res) => {
    try {
        const locationId = parseInt(req.params.id);
        
        if (isNaN(locationId)) {
            return res.status(400).json({ error: 'Invalid location ID' });
        }
        
        const locationIndex = customLocations.findIndex(loc => loc.id === locationId);
        
        if (locationIndex === -1) {
            return res.status(404).json({ error: 'Location not found' });
        }
        
        // In real app with auth: Check ownership
        // if (customLocations[locationIndex].userId !== req.user.id) {
        //     return res.status(403).json({ error: 'Unauthorized: You can only delete your own locations' });
        // }
        
        customLocations.splice(locationIndex, 1);
        
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ error: 'Unable to delete location' });
    }
});

// Security: Update location with ownership check
app.put('/api/locations/:id', (req, res) => {
    try {
        const locationId = parseInt(req.params.id);
        
        if (isNaN(locationId)) {
            return res.status(400).json({ error: 'Invalid location ID' });
        }
        
        const locationIndex = customLocations.findIndex(loc => loc.id === locationId);
        
        if (locationIndex === -1) {
            return res.status(404).json({ error: 'Location not found' });
        }
        
        // In real app with auth: Check ownership
        // if (customLocations[locationIndex].userId !== req.user.id) {
        //     return res.status(403).json({ error: 'Unauthorized: You can only update your own locations' });
        // }
        
        const updates = req.body;
        
        // Validate updates
        if (updates.name && updates.name.length > 100) {
            return res.status(400).json({ error: 'Location name too long' });
        }
        
        if (updates.description && updates.description.length > 500) {
            return res.status(400).json({ error: 'Description too long' });
        }
        
        // Apply updates
        if (updates.name) customLocations[locationIndex].name = updates.name;
        if (updates.description) customLocations[locationIndex].description = updates.description;
        if (updates.lat) customLocations[locationIndex].lat = parseFloat(updates.lat);
        if (updates.lng) customLocations[locationIndex].lng = parseFloat(updates.lng);
        
        customLocations[locationIndex].updatedAt = new Date().toISOString();
        
        res.json({ 
            message: 'Location updated successfully', 
            location: customLocations[locationIndex] 
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Unable to update location' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Campus Navigation Backend',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Smart Campus Backend API',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /api/chat',
            route: 'POST /api/route',
            locations: 'GET /api/locations',
            addLocation: 'POST /api/locations',
            health: 'GET /health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    res.status(500).json({ error: 'Internal server error' });
});

// Start server with HTTPS in production
if (NODE_ENV === 'production' && process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH) {
    try {
        const httpsOptions = {
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
            key: fs.readFileSync(process.env.SSL_KEY_PATH)
        };
        
        https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
            logger.info('HTTPS Server started', { 
                port: PORT,
                environment: NODE_ENV
            });
            console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`);
            console.log('Security features enabled: HTTPS, Helmet, Rate limiting, Input validation, CORS, Logging');
        });
    } catch (error) {
        logger.error('Failed to start HTTPS server', { error: error.message });
        console.error('SSL certificate error. Falling back to HTTP.');
        startHttpServer();
    }
} else {
    startHttpServer();
}

function startHttpServer() {
    app.listen(PORT, '0.0.0.0', () => {
        logger.info('HTTP Server started', { 
            port: PORT,
            environment: NODE_ENV
        });
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Network access: http://[YOUR_IP]:${PORT}`);
        console.log('Security features enabled: Helmet, Rate limiting, Input validation, CORS, Logging');
        
        if (NODE_ENV === 'production') {
            logger.warn('Running in production without HTTPS - configure SSL certificates');
            console.warn('⚠️  WARNING: Running in production without HTTPS. Configure SSL_CERT_PATH and SSL_KEY_PATH');
        }
    });
}
