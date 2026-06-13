const logger = require('./logger');
const abuseProtection = require('./abuseProtection');

// Anti-scraping middleware
const antiScraping = (req, res, next) => {
    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';
    
    // Track data access patterns
    if (!antiScraping.dataAccess) {
        antiScraping.dataAccess = new Map();
    }
    
    const now = Date.now();
    const key = `${ip}:data`;
    
    if (!antiScraping.dataAccess.has(key)) {
        antiScraping.dataAccess.set(key, {
            count: 1,
            firstAccess: now,
            resetTime: now + 60000, // 1 minute
            patterns: []
        });
    } else {
        const record = antiScraping.dataAccess.get(key);
        
        // Reset if window expired
        if (now > record.resetTime) {
            record.count = 1;
            record.firstAccess = now;
            record.resetTime = now + 60000;
            record.patterns = [];
        } else {
            record.count++;
            
            // Detect scraping patterns
            const timeSinceFirst = now - record.firstAccess;
            const requestsPerSecond = record.count / (timeSinceFirst / 1000);
            
            // Pattern 1: Too many requests too fast
            if (requestsPerSecond > 5) {
                abuseProtection.markSuspicious(ip, 'Potential data scraping - high request rate');
                logger.logSuspicious('Potential scraping detected - high request rate', {
                    ip,
                    requestsPerSecond: requestsPerSecond.toFixed(2),
                    userAgent
                });
                
                return res.status(429).json({
                    error: 'Too many requests. Please slow down.',
                    retryAfter: Math.ceil((record.resetTime - now) / 1000)
                });
            }
            
            // Pattern 2: Sequential access pattern (accessing all data systematically)
            if (record.count > 20) {
                abuseProtection.markSuspicious(ip, 'Potential data scraping - excessive access');
                logger.logSuspicious('Potential scraping detected - excessive data access', {
                    ip,
                    count: record.count,
                    userAgent
                });
                
                return res.status(429).json({
                    error: 'Access limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((record.resetTime - now) / 1000)
                });
            }
        }
    }
    
    // Add response fingerprinting to detect automated parsing
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        // Add a timestamp to responses to detect caching/scraping
        if (typeof data === 'object' && data !== null) {
            data._timestamp = Date.now();
            data._requestId = `${ip}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        return originalJson(data);
    };
    
    next();
};

// Cleanup old entries periodically
setInterval(() => {
    if (antiScraping.dataAccess) {
        const now = Date.now();
        for (const [key, record] of antiScraping.dataAccess) {
            if (now > record.resetTime + 300000) { // 5 minutes after reset
                antiScraping.dataAccess.delete(key);
            }
        }
    }
}, 300000); // Every 5 minutes

module.exports = antiScraping;
