const jwt = require('jsonwebtoken');
const User = require('../model/User');
const logger = require('../utils/logger');
const rateLimiter = require('../middleware/rateLimiter');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const rateCheck = rateLimiter.checkAccountCreation(req.ip);
        if (!rateCheck.allowed) {
            return res.status(429).json({ error: rateCheck.reason, retryAfter: rateCheck.retryAfter });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Account already exists' });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user);

        logger.info('New account created', { ip: req.ip, email });

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        logger.logApiError('/auth/register', err, { ip: req.ip });
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const identifier = `${req.ip}:${email}`;
        const rateCheck = rateLimiter.checkLoginAttempt(identifier);
        if (!rateCheck.allowed) {
            return res.status(429).json({ error: rateCheck.reason, retryAfter: rateCheck.retryAfter });
        }

        // password field has select: false, so we must explicitly include it
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            logger.logAuth(false, { ip: req.ip, email, reason: 'Invalid credentials' });
            return res.status(401).json({ error: 'Invalid email or password', attemptsRemaining: rateCheck.attemptsRemaining });
        }

        rateLimiter.resetLoginAttempts(identifier);
        const token = generateToken(user);
        logger.logAuth(true, { ip: req.ip, email });

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        logger.logApiError('/auth/login', err, { ip: req.ip });
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.logout = (req, res) => {
    logger.info('User logged out', { ip: req.ip });
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const identifier = `${req.ip}:reset:${email}`;
        const rateCheck = rateLimiter.checkLoginAttempt(identifier);
        if (!rateCheck.allowed) {
            return res.status(429).json({
                error: 'Too many password reset attempts. Please try again later.',
                retryAfter: rateCheck.retryAfter
            });
        }

        // Always return success to prevent email enumeration
        logger.info('Password reset requested', { ip: req.ip, email });
        res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
    } catch (err) {
        logger.logApiError('/auth/forgot-password', err, { ip: req.ip });
        res.status(500).json({ error: 'Password reset request failed' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        logger.logApiError('/auth/me', err, { ip: req.ip });
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
