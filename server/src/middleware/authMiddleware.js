const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        logger.security('Invalid JWT token', { ip: req.ip, error: err.message });
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        logger.security('Unauthorized admin access attempt', { ip: req.ip, userId: req.user?.id });
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
