const logger = require('../utils/logger');
const rateLimiter = require('./rateLimiter');

const antiScraping = (req, res, next) => {
    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';

    if (!antiScraping.dataAccess) {
        antiScraping.dataAccess = new Map();
    }

    const now = Date.now();
    const key = `${ip}:data`;

    if (!antiScraping.dataAccess.has(key)) {
        antiScraping.dataAccess.set(key, { count: 1, firstAccess: now, resetTime: now + 60000 });
    } else {
        const record = antiScraping.dataAccess.get(key);

        if (now > record.resetTime) {
            record.count = 1;
            record.firstAccess = now;
            record.resetTime = now + 60000;
        } else {
            record.count++;

            const timeSinceFirst = now - record.firstAccess;
            const requestsPerSecond = record.count / (timeSinceFirst / 1000);

            if (requestsPerSecond > 5) {
                rateLimiter.markSuspicious(ip, 'Potential data scraping - high request rate');
                logger.logSuspicious('Potential scraping detected', { ip, requestsPerSecond: requestsPerSecond.toFixed(2), userAgent });
                return res.status(429).json({ error: 'Too many requests. Please slow down.', retryAfter: Math.ceil((record.resetTime - now) / 1000) });
            }

            if (record.count > 20) {
                rateLimiter.markSuspicious(ip, 'Potential data scraping - excessive access');
                logger.logSuspicious('Excessive data access detected', { ip, count: record.count, userAgent });
                return res.status(429).json({ error: 'Access limit exceeded. Please try again later.', retryAfter: Math.ceil((record.resetTime - now) / 1000) });
            }
        }
    }

    next();
};

setInterval(() => {
    if (antiScraping.dataAccess) {
        const now = Date.now();
        for (const [key, record] of antiScraping.dataAccess) {
            if (now > record.resetTime + 300000) antiScraping.dataAccess.delete(key);
        }
    }
}, 300000);

module.exports = antiScraping;
