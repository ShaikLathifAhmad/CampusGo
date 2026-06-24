const logger = require('../utils/logger');

class RateLimiter {
    constructor() {
        this.requestCounts = new Map();
        this.loginAttempts = new Map();
        this.accountCreation = new Map();
        this.aiRequests = new Map();
        this.suspiciousIPs = new Set();
        this.blockedIPs = new Set();

        this.config = {
            api: { window: 60000, maxRequests: 100 },
            login: { window: 900000, maxAttempts: 5, lockoutDuration: 1800000 },
            accountCreation: { window: 3600000, maxAccounts: 3, dailyLimit: 10 },
            aiGeneration: { window: 60000, maxRequests: 10, hourlyLimit: 100 },
            botDetection: { requestsPerSecond: 10, autoBlockThreshold: 3 }
        };

        setInterval(() => this.cleanup(), 300000);
    }

    checkApiRateLimit(ip, path) {
        const now = Date.now();
        const key = `${ip}:${path}`;

        if (this.blockedIPs.has(ip)) {
            return { allowed: false, reason: 'IP blocked due to abuse', retryAfter: 3600 };
        }

        if (!this.requestCounts.has(key)) {
            this.requestCounts.set(key, { count: 1, resetTime: now + this.config.api.window, firstRequest: now });
            return { allowed: true };
        }

        const record = this.requestCounts.get(key);

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.config.api.window;
            record.firstRequest = now;
            return { allowed: true };
        }

        const requestsPerSecond = record.count / ((now - record.firstRequest) / 1000);
        if (requestsPerSecond > this.config.botDetection.requestsPerSecond) {
            this.markSuspicious(ip, 'High request rate');
        }

        if (record.count >= this.config.api.maxRequests) {
            logger.logRateLimit(ip, { path, count: record.count });
            return { allowed: false, reason: 'Rate limit exceeded', retryAfter: Math.ceil((record.resetTime - now) / 1000) };
        }

        record.count++;
        return { allowed: true };
    }

    checkLoginAttempt(identifier) {
        const now = Date.now();

        if (!this.loginAttempts.has(identifier)) {
            this.loginAttempts.set(identifier, { attempts: 1, resetTime: now + this.config.login.window, lockedUntil: null });
            return { allowed: true };
        }

        const record = this.loginAttempts.get(identifier);

        if (record.lockedUntil && now < record.lockedUntil) {
            return {
                allowed: false,
                reason: 'Account temporarily locked due to too many failed attempts',
                retryAfter: Math.ceil((record.lockedUntil - now) / 1000)
            };
        }

        if (now > record.resetTime) {
            record.attempts = 1;
            record.resetTime = now + this.config.login.window;
            record.lockedUntil = null;
            return { allowed: true };
        }

        if (record.attempts >= this.config.login.maxAttempts) {
            record.lockedUntil = now + this.config.login.lockoutDuration;
            return {
                allowed: false,
                reason: 'Too many failed login attempts. Account locked.',
                retryAfter: this.config.login.lockoutDuration / 1000
            };
        }

        record.attempts++;
        return { allowed: true, attemptsRemaining: this.config.login.maxAttempts - record.attempts };
    }

    resetLoginAttempts(identifier) {
        this.loginAttempts.delete(identifier);
    }

    checkAccountCreation(ip) {
        const now = Date.now();

        if (this.blockedIPs.has(ip)) {
            return { allowed: false, reason: 'IP blocked due to abuse' };
        }

        if (!this.accountCreation.has(ip)) {
            this.accountCreation.set(ip, {
                count: 1,
                resetTime: now + this.config.accountCreation.window,
                dailyCount: 1,
                dailyResetTime: now + 86400000
            });
            return { allowed: true };
        }

        const record = this.accountCreation.get(ip);

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.config.accountCreation.window;
        } else if (record.count >= this.config.accountCreation.maxAccounts) {
            return {
                allowed: false,
                reason: 'Too many account creation attempts. Please try again later.',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            };
        } else {
            record.count++;
        }

        if (now > record.dailyResetTime) {
            record.dailyCount = 1;
            record.dailyResetTime = now + 86400000;
        } else if (record.dailyCount >= this.config.accountCreation.dailyLimit) {
            this.markSuspicious(ip, 'Excessive daily account creation');
            return { allowed: false, reason: 'Daily account creation limit reached', retryAfter: Math.ceil((record.dailyResetTime - now) / 1000) };
        } else {
            record.dailyCount++;
        }

        return { allowed: true };
    }

    checkAIRequest(ip) {
        const now = Date.now();

        if (this.blockedIPs.has(ip)) {
            return { allowed: false, reason: 'IP blocked due to abuse' };
        }

        if (!this.aiRequests.has(ip)) {
            this.aiRequests.set(ip, { count: 1, resetTime: now + this.config.aiGeneration.window, hourlyCount: 1, hourlyResetTime: now + 3600000 });
            return { allowed: true };
        }

        const record = this.aiRequests.get(ip);

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.config.aiGeneration.window;
        } else if (record.count >= this.config.aiGeneration.maxRequests) {
            logger.logRateLimit(ip, { endpoint: 'AI generation', count: record.count });
            return { allowed: false, reason: 'AI request rate limit exceeded', retryAfter: Math.ceil((record.resetTime - now) / 1000) };
        } else {
            record.count++;
        }

        if (now > record.hourlyResetTime) {
            record.hourlyCount = 1;
            record.hourlyResetTime = now + 3600000;
        } else if (record.hourlyCount >= this.config.aiGeneration.hourlyLimit) {
            return { allowed: false, reason: 'Hourly AI request limit reached', retryAfter: Math.ceil((record.hourlyResetTime - now) / 1000) };
        } else {
            record.hourlyCount++;
        }

        return { allowed: true };
    }

    detectBot(req) {
        const userAgent = req.get('user-agent') || '';
        const ip = req.ip;

        if (!userAgent || userAgent.length < 10) {
            this.markSuspicious(ip, 'Missing or suspicious user agent');
            return { isBot: true, reason: 'Missing or invalid user agent', confidence: 'high' };
        }

        const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python-requests/i, /headless/i, /phantom/i, /selenium/i];
        for (const pattern of botPatterns) {
            if (pattern.test(userAgent)) {
                return { isBot: true, reason: 'Bot user agent detected', confidence: 'medium' };
            }
        }

        let suspicionScore = 0;
        if (!req.get('accept-language')) suspicionScore++;
        if (!req.get('accept')) suspicionScore++;
        if (!req.get('referer') && req.method === 'POST') suspicionScore++;

        if (suspicionScore >= 2) {
            this.markSuspicious(ip, 'Missing common headers');
            return { isBot: true, reason: 'Missing common browser headers', confidence: 'medium' };
        }

        return { isBot: false };
    }

    markSuspicious(ip, reason) {
        if (!this.suspiciousIPs.has(ip)) {
            this.suspiciousIPs.add(ip);
            logger.logSuspicious('IP marked as suspicious', { ip, reason });

            const suspiciousCount = this.getSuspiciousCount(ip);
            if (suspiciousCount >= this.config.botDetection.autoBlockThreshold) {
                this.blockIP(ip, 'Multiple suspicious activities');
            }
        }
    }

    getSuspiciousCount(ip) {
        let count = 0;
        for (const [key, record] of this.requestCounts) {
            if (key.startsWith(ip) && record.count > this.config.api.maxRequests * 0.8) {
                count++;
            }
        }
        return count;
    }

    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        logger.security('IP blocked', { ip, reason, severity: 'HIGH' });
    }

    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.suspiciousIPs.delete(ip);
        logger.info('IP unblocked', { ip });
    }

    isBlocked(ip) {
        return this.blockedIPs.has(ip);
    }

    getStats() {
        return {
            requestCounts: this.requestCounts.size,
            loginAttempts: this.loginAttempts.size,
            accountCreation: this.accountCreation.size,
            aiRequests: this.aiRequests.size,
            suspiciousIPs: this.suspiciousIPs.size,
            blockedIPs: this.blockedIPs.size
        };
    }

    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.requestCounts) {
            if (now > record.resetTime + 300000) this.requestCounts.delete(key);
        }
        for (const [key, record] of this.loginAttempts) {
            if (now > record.resetTime + 300000 && (!record.lockedUntil || now > record.lockedUntil)) {
                this.loginAttempts.delete(key);
            }
        }
        for (const [key, record] of this.accountCreation) {
            if (now > record.dailyResetTime + 300000) this.accountCreation.delete(key);
        }
        for (const [key, record] of this.aiRequests) {
            if (now > record.hourlyResetTime + 300000) this.aiRequests.delete(key);
        }
    }
}

module.exports = new RateLimiter();
