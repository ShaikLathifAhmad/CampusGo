const express = require('express');
const router = express.Router();
const logger = require('./logger');
const abuseProtection = require('./abuseProtection');
const { validateHoneypot, validateSubmissionTime } = require('./captchaMiddleware');

// Mock user database (replace with real database in production)
const users = new Map();

// Login endpoint with rate limiting
router.post('/login', validateHoneypot, validateSubmissionTime, async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip = req.ip;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Check login rate limit
        const identifier = `${ip}:${email}`;
        const rateLimit = abuseProtection.checkLoginAttempt(identifier);
        
        if (!rateLimit.allowed) {
            logger.security('Login rate limit exceeded', { 
                ip, 
                email,
                reason: rateLimit.reason
            });
            return res.status(429).json({ 
                error: rateLimit.reason,
                retryAfter: rateLimit.retryAfter
            });
        }
        
        // Simulate authentication (replace with real auth logic)
        const user = users.get(email);
        
        if (!user || user.password !== password) {
            logger.logAuth(false, { ip, email, reason: 'Invalid credentials' });
            
            return res.status(401).json({ 
                error: 'Invalid email or password',
                attemptsRemaining: rateLimit.attemptsRemaining
            });
        }
        
        // Successful login - reset attempts
        abuseProtection.resetLoginAttempts(identifier);
        logger.logAuth(true, { ip, email });
        
        // Return success (in production, return JWT token)
        res.json({ 
            success: true,
            message: 'Login successful',
            user: {
                email: user.email,
                name: user.name
            }
        });
        
    } catch (error) {
        logger.logApiError('/auth/login', error, { ip: req.ip });
        res.status(500).json({ error: 'Login failed' });
    }
});

// Register endpoint with account creation rate limiting
router.post('/register', validateHoneypot, validateSubmissionTime, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const ip = req.ip;
        
        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name required' });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        
        // Check account creation rate limit
        const rateLimit = abuseProtection.checkAccountCreation(ip);
        
        if (!rateLimit.allowed) {
            logger.security('Account creation rate limit exceeded', { 
                ip, 
                email,
                reason: rateLimit.reason
            });
            return res.status(429).json({ 
                error: rateLimit.reason,
                retryAfter: rateLimit.retryAfter
            });
        }
        
        // Check if user already exists
        if (users.has(email)) {
            logger.warn('Attempted duplicate account creation', { ip, email });
            return res.status(409).json({ error: 'Account already exists' });
        }
        
        // Create user (in production, hash password with bcrypt)
        users.set(email, {
            email,
            password, // In production: await bcrypt.hash(password, 12)
            name,
            createdAt: new Date().toISOString(),
            createdFrom: ip
        });
        
        logger.info('New account created', { ip, email });
        
        res.status(201).json({ 
            success: true,
            message: 'Account created successfully',
            user: {
                email,
                name
            }
        });
        
    } catch (error) {
        logger.logApiError('/auth/register', error, { ip: req.ip });
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Password reset request endpoint with rate limiting
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const ip = req.ip;
        
        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }
        
        // Use login rate limiter for password reset attempts
        const identifier = `${ip}:reset:${email}`;
        const rateLimit = abuseProtection.checkLoginAttempt(identifier);
        
        if (!rateLimit.allowed) {
            logger.security('Password reset rate limit exceeded', { ip, email });
            return res.status(429).json({ 
                error: 'Too many password reset attempts. Please try again later.',
                retryAfter: rateLimit.retryAfter
            });
        }
        
        // Always return success to prevent email enumeration
        logger.info('Password reset requested', { ip, email });
        
        res.json({ 
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
        
    } catch (error) {
        logger.logApiError('/auth/forgot-password', error, { ip: req.ip });
        res.status(500).json({ error: 'Password reset request failed' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    logger.info('User logged out', { ip: req.ip });
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get abuse protection stats (admin only - add auth middleware in production)
router.get('/admin/abuse-stats', (req, res) => {
    // In production, add authentication middleware to verify admin
    const stats = abuseProtection.getStats();
    res.json(stats);
});

// Unblock IP (admin only - add auth middleware in production)
router.post('/admin/unblock-ip', (req, res) => {
    // In production, add authentication middleware to verify admin
    const { ip } = req.body;
    
    if (!ip) {
        return res.status(400).json({ error: 'IP address required' });
    }
    
    abuseProtection.unblockIP(ip);
    logger.info('IP unblocked by admin', { 
        unblockedIP: ip, 
        adminIP: req.ip 
    });
    
    res.json({ success: true, message: `IP ${ip} has been unblocked` });
});

module.exports = router;
