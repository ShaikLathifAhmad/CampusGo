const logger = require('./logger');

// Advanced rate limiting with multiple tiers
class AbuseProtection {
    constructor() {
        // Rate limit storage
        this.requestCounts = new Map();
        this.loginAttempts = new Map();
        this.accountCreation = new Map();
        this.aiRequests = new Map();
        this.suspiciousIPs = new Set();
        this.blockedIPs = new Set();
        
        // Configuration
        this.config = {
            // General API rate limits
            api: {
                window: 60000, // 1 minute
                maxRequests: 100,
                burstAllowance: 20
            },
            // Login attempt limits
            login: {
                window: 900000, // 15 minutes
                maxAttempts: 5,
                lockoutDuration: 1800000 // 30 minutes
            },
            // Account creation limits
            accountCreation: {
                window: 3600000, // 1 hour
                maxAccounts: 3,
                dailyLimit: 10
            },
            // AI generation limits
            aiGeneration: {
                window: 60000, // 1 minute
                maxRequests: 10,
                hourlyLimit: 100
            },
            // Bot detection thresholds
            botDetection: {
                requestsPerSecond: 10,
                suspiciousPatterns: 5,
                autoBlockThreshold: 3
            }
        };
        
        // Cleanup old entries every 5 minutes
        setInterval(() => this.cleanup(), 300000);
    }
    
    // General API rate limiter
    checkApiRateLimit(ip, path) {
        const now = Date.now();
        const key = `${ip}:${path}`;
        
        if (this.blockedIPs.has(ip)) {
            logger.logSuspicious('Blocked IP attempted access', {
                ip,
                path,
                severity: 'HIGH'
            });
            return {
                allowed: false,
                reason: 'IP blocked due to abuse',
                retryAfter: 3600
            };
        }
        
        if (!this.requestCounts.has(key)) {
            this.requestCounts.set(key, {
                count: 1,
                resetTime: now + this.config.api.window,
                firstRequest: now
            });
            return { allowed: true };
        }
        
        const record = this.requestCounts.get(key);
        
        // Reset if window expired
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.config.api.window;
            record.firstRequest = now;
            return { allowed: true };
        }
        
        // Check for bot-like behavior (too many requests too fast)
        const requestsPerSecond = record.count / ((now - record.firstRequest) / 1000);
        if (requestsPerSecond > this.config.botDetection.requestsPerSecond) {
            this.markSuspicious(ip, 'High request rate');
            logger.logSuspicious('Potential bot detected - high request rate', {
                ip,
                path,
                requestsPerSecond: requestsPerSecond.toFixed(2)
            });
        }
        
        // Check if limit exceeded
        if (record.count >= this.config.api.maxRequests) {
            logger.logRateLimit(ip, { path, count: record.count });
            return {
                allowed: false,
                reason: 'Rate limit exceeded',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            };
        }
        
        record.count++;
        return { allowed: true };
    }
    
    // Login attempt rate limiter
    checkLoginAttempt(identifier) {
        const now = Date.now();
        
        if (!this.loginAttempts.has(identifier)) {
            this.loginAttempts.set(identifier, {
                attempts: 1,
                resetTime: now + this.config.login.window,
                lockedUntil: null
            });
            return { allowed: true };
        }
        
        const record = this.loginAttempts.get(identifier);
        
        // Check if account is locked
        if (record.lockedUntil && now < record.lockedUntil) {
            logger.security('Login attempt on locked account', {
                identifier,
                remainingLockTime: Math.ceil((record.lockedUntil - now) / 1000)
            });
            return {
                allowed: false,
                reason: 'Account temporarily locked due to too many failed attempts',
                retryAfter: Math.ceil((record.lockedUntil - now) / 1000)
            };
        }
        
        // Reset if window expired
        if (now > record.resetTime) {
            record.attempts = 1;
            record.resetTime = now + this.config.login.window;
            record.lockedUntil = null;
            return { allowed: true };
        }
        
        // Check if limit exceeded
        if (record.attempts >= this.config.login.maxAttempts) {
            record.lockedUntil = now + this.config.login.lockoutDuration;
            logger.security('Account locked due to failed login attempts', {
                identifier,
                attempts: record.attempts,
                lockoutDuration: this.config.login.lockoutDuration / 1000
            });
            return {
                allowed: false,
                reason: 'Too many failed login attempts. Account locked.',
                retryAfter: this.config.login.lockoutDuration / 1000
            };
        }
        
        record.attempts++;
        return { allowed: true, attemptsRemaining: this.config.login.maxAttempts - record.attempts };
    }
    
    // Reset login attempts on successful login
    resetLoginAttempts(identifier) {
        this.loginAttempts.delete(identifier);
    }
    
    // Account creation rate limiter
    checkAccountCreation(ip) {
        const now = Date.now();
        
        if (this.blockedIPs.has(ip)) {
            return {
                allowed: false,
                reason: 'IP blocked due to abuse'
            };
        }
        
        if (!this.accountCreation.has(ip)) {
            this.accountCreation.set(ip, {
                count: 1,
                resetTime: now + this.config.accountCreation.window,
                dailyCount: 1,
                dailyResetTime: now + 86400000 // 24 hours
            });
            return { allowed: true };
        }
        
        const record = this.accountCreation.get(ip);
        
        // Reset hourly counter
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.config.accountCreation.window;
        } else if (record.count >= this.config.accountCreation.maxAccounts) {
            logger.logSuspicious('Excessive account creation attempts', {
                ip,
                count: record.count
            });
            return {
                allowed: false,
                reason: 'Too many account creation attempts. Please try again later.',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            };
        } else {
            record.count++;
        }
        
        // Reset daily counter
        if (now > record.dailyResetTime) {
            record.dailyCount = 1;
            record.dailyResetTime = now + 86400000;
        } else if (record.dailyCount >= this.config.accountCreation.dailyLimit) {
            this.markSuspicious(ip, 'Excessive daily account creation');
            logger.logSuspicious('Daily account creation limit exceeded', {
                ip,
                dailyCount: record.dailyCount
            });
            return {
                allowed: false,
                reason: 'Daily account creation limit reached',
                retryAfter: Math.ceil((record.dailyResetTime - now) / 1000)
            };
        } else {
            record.dailyCount++;
        }
        
        return { allowed: true };
    }
    
    // AI generation rate limiter
    checkAIRequest(ip) {
        const now = Date.now();
        
        if (this.blockedIPs.has(ip)) {
            return {
                allowed: false,
                reason: 'IP blocked due to abuse'
            };
        }
        
        if (!this.aiRequests.has(ip)) {
            this.aiRequests.set(ip, {
                count: 1,
                resetTime: now + this.config.aiGeneration.window,
                hourlyCount: 1,
                hourlyResetTime: now + 3600000
            });
            return { allowed: true };
        }
        
        const record = this.aiRequests.get(ip);
        
        // Reset minute counter
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.config.aiGeneration.window;
        } else if (record.count >= this.config.aiGeneration.maxRequests) {
            logger.logRateLimit(ip, {
                endpoint: 'AI generation',
                count: record.count
            });
            return {
                allowed: false,
                reason: 'AI request rate limit exceeded',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            };
        } else {
            record.count++;
        }
        
        // Reset hourly counter
        if (now > record.hourlyResetTime) {
            record.hourlyCount = 1;
            record.hourlyResetTime = now + 3600000;
        } else if (record.hourlyCount >= this.config.aiGeneration.hourlyLimit) {
            logger.logSuspicious('Hourly AI request limit exceeded', {
                ip,
                hourlyCount: record.hourlyCount
            });
            return {
                allowed: false,
                reason: 'Hourly AI request limit reached',
                retryAfter: Math.ceil((record.hourlyResetTime - now) / 1000)
            };
        } else {
            record.hourlyCount++;
        }
        
        return { allowed: true };
    }
    
    // Bot detection middleware
    detectBot(req) {
        const userAgent = req.get('user-agent') || '';
        const ip = req.ip;
        
        // Check for missing or suspicious user agents
        if (!userAgent || userAgent.length < 10) {
            this.markSuspicious(ip, 'Missing or suspicious user agent');
            return {
                isBot: true,
                reason: 'Missing or invalid user agent',
                confidence: 'high'
            };
        }
        
        // Check for common bot patterns
        const botPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /curl/i, /wget/i, /python-requests/i, /java/i,
            /headless/i, /phantom/i, /selenium/i
        ];
        
        for (const pattern of botPatterns) {
            if (pattern.test(userAgent)) {
                logger.info('Bot detected via user agent', { ip, userAgent });
                return {
                    isBot: true,
                    reason: 'Bot user agent detected',
                    confidence: 'medium'
                };
            }
        }
        
        // Check for missing common headers
        const hasAcceptLanguage = req.get('accept-language');
        const hasAccept = req.get('accept');
        const hasReferer = req.get('referer');
        
        let suspicionScore = 0;
        if (!hasAcceptLanguage) suspicionScore++;
        if (!hasAccept) suspicionScore++;
        if (!hasReferer && req.method === 'POST') suspicionScore++;
        
        if (suspicionScore >= 2) {
            this.markSuspicious(ip, 'Missing common headers');
            return {
                isBot: true,
                reason: 'Missing common browser headers',
                confidence: 'medium'
            };
        }
        
        return { isBot: false };
    }
    
    // Mark IP as suspicious
    markSuspicious(ip, reason) {
        if (!this.suspiciousIPs.has(ip)) {
            this.suspiciousIPs.add(ip);
            logger.logSuspicious('IP marked as suspicious', { ip, reason });
            
            // Auto-block after multiple suspicious activities
            const suspiciousCount = this.getSuspiciousCount(ip);
            if (suspiciousCount >= this.config.botDetection.autoBlockThreshold) {
                this.blockIP(ip, 'Multiple suspicious activities');
            }
        }
    }
    
    // Get suspicious activity count for IP
    getSuspiciousCount(ip) {
        let count = 0;
        for (const [key, record] of this.requestCounts) {
            if (key.startsWith(ip) && record.count > this.config.api.maxRequests * 0.8) {
                count++;
            }
        }
        return count;
    }
    
    // Block IP
    blockIP(ip, reason) {
        this.blockedIPs.add(ip);
        logger.security('IP blocked', { ip, reason, severity: 'HIGH' });
    }
    
    // Unblock IP (manual intervention)
    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.suspiciousIPs.delete(ip);
        logger.info('IP unblocked', { ip });
    }
    
    // Check if IP is blocked
    isBlocked(ip) {
        return this.blockedIPs.has(ip);
    }
    
    // Cleanup old entries
    cleanup() {
        const now = Date.now();
        
        // Cleanup request counts
        for (const [key, record] of this.requestCounts) {
            if (now > record.resetTime + 300000) { // 5 minutes after reset
                this.requestCounts.delete(key);
            }
        }
        
        // Cleanup login attempts
        for (const [key, record] of this.loginAttempts) {
            if (now > record.resetTime + 300000 && (!record.lockedUntil || now > record.lockedUntil)) {
                this.loginAttempts.delete(key);
            }
        }
        
        // Cleanup account creation
        for (const [key, record] of this.accountCreation) {
            if (now > record.dailyResetTime + 300000) {
                this.accountCreation.delete(key);
            }
        }
        
        // Cleanup AI requests
        for (const [key, record] of this.aiRequests) {
            if (now > record.hourlyResetTime + 300000) {
                this.aiRequests.delete(key);
            }
        }
        
        logger.info('Abuse protection cleanup completed', {
            requestCounts: this.requestCounts.size,
            loginAttempts: this.loginAttempts.size,
            accountCreation: this.accountCreation.size,
            aiRequests: this.aiRequests.size,
            suspiciousIPs: this.suspiciousIPs.size,
            blockedIPs: this.blockedIPs.size
        });
    }
    
    // Get statistics
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
}

module.exports = new AbuseProtection();
