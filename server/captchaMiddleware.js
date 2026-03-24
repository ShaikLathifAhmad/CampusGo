const logger = require('./logger');
const abuseProtection = require('./abuseProtection');

// Simple challenge-response CAPTCHA (in production, use reCAPTCHA or hCaptcha)
class CaptchaService {
    constructor() {
        this.challenges = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
    }
    
    // Generate a simple math challenge
    generateChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let answer;
        switch (operation) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '*':
                answer = num1 * num2;
                break;
        }
        
        const challengeId = this.generateId();
        const expiresAt = Date.now() + 300000; // 5 minutes
        
        this.challenges.set(challengeId, {
            answer,
            expiresAt,
            attempts: 0
        });
        
        return {
            challengeId,
            question: `${num1} ${operation} ${num2} = ?`,
            expiresAt
        };
    }
    
    // Verify challenge response
    verifyChallenge(challengeId, answer, ip) {
        if (!this.challenges.has(challengeId)) {
            logger.logSuspicious('Invalid CAPTCHA challenge ID', { ip, challengeId });
            return { valid: false, reason: 'Invalid or expired challenge' };
        }
        
        const challenge = this.challenges.get(challengeId);
        
        // Check expiration
        if (Date.now() > challenge.expiresAt) {
            this.challenges.delete(challengeId);
            return { valid: false, reason: 'Challenge expired' };
        }
        
        // Check attempts
        challenge.attempts++;
        if (challenge.attempts > 3) {
            this.challenges.delete(challengeId);
            abuseProtection.markSuspicious(ip, 'Multiple failed CAPTCHA attempts');
            logger.logSuspicious('Multiple failed CAPTCHA attempts', { ip, challengeId });
            return { valid: false, reason: 'Too many attempts' };
        }
        
        // Verify answer
        if (parseInt(answer) === challenge.answer) {
            this.challenges.delete(challengeId);
            return { valid: true };
        }
        
        return { valid: false, reason: 'Incorrect answer' };
    }
    
    // Generate unique ID
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Cleanup expired challenges
    cleanup() {
        const now = Date.now();
        for (const [id, challenge] of this.challenges) {
            if (now > challenge.expiresAt) {
                this.challenges.delete(id);
            }
        }
    }
}

const captchaService = new CaptchaService();

// Middleware to require CAPTCHA for suspicious IPs
const requireCaptcha = (req, res, next) => {
    const ip = req.ip;
    
    // Check if IP is suspicious
    if (abuseProtection.suspiciousIPs && abuseProtection.suspiciousIPs.has(ip)) {
        const { challengeId, answer } = req.body;
        
        if (!challengeId || !answer) {
            // Generate new challenge
            const challenge = captchaService.generateChallenge();
            logger.info('CAPTCHA required for suspicious IP', { ip });
            return res.status(403).json({
                error: 'CAPTCHA verification required',
                captchaRequired: true,
                challenge: {
                    id: challenge.challengeId,
                    question: challenge.question
                }
            });
        }
        
        // Verify challenge
        const verification = captchaService.verifyChallenge(challengeId, answer, ip);
        if (!verification.valid) {
            const challenge = captchaService.generateChallenge();
            return res.status(403).json({
                error: verification.reason,
                captchaRequired: true,
                challenge: {
                    id: challenge.challengeId,
                    question: challenge.question
                }
            });
        }
        
        // CAPTCHA passed - remove from suspicious list temporarily
        logger.info('CAPTCHA verification passed', { ip });
    }
    
    next();
};

// Honeypot field validator
const validateHoneypot = (req, res, next) => {
    // Check for honeypot fields (fields that should be empty)
    const honeypotFields = ['website', 'url', 'homepage', 'phone_number'];
    
    for (const field of honeypotFields) {
        if (req.body[field]) {
            const ip = req.ip;
            abuseProtection.markSuspicious(ip, 'Honeypot field filled');
            logger.logSuspicious('Bot detected via honeypot field', {
                ip,
                field,
                value: req.body[field]
            });
            
            // Return success to not alert the bot
            return res.json({ success: true, message: 'Request processed' });
        }
    }
    
    next();
};

// Time-based validation (form submission too fast)
const validateSubmissionTime = (req, res, next) => {
    const { formLoadTime } = req.body;
    
    if (formLoadTime) {
        const submissionTime = Date.now();
        const timeTaken = submissionTime - parseInt(formLoadTime);
        
        // If form submitted in less than 2 seconds, likely a bot
        if (timeTaken < 2000) {
            const ip = req.ip;
            abuseProtection.markSuspicious(ip, 'Form submitted too quickly');
            logger.logSuspicious('Potential bot - form submitted too quickly', {
                ip,
                timeTaken: `${timeTaken}ms`
            });
            
            // Return success to not alert the bot
            return res.json({ success: true, message: 'Request processed' });
        }
    }
    
    next();
};

module.exports = {
    captchaService,
    requireCaptcha,
    validateHoneypot,
    validateSubmissionTime
};
