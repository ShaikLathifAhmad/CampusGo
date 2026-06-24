const logger = require('../utils/logger');
const rateLimiter = require('./rateLimiter');

class CaptchaService {
    constructor() {
        this.challenges = new Map();
        setInterval(() => this.cleanup(), 300000);
    }

    generateChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        const answerMap = { '+': num1 + num2, '-': num1 - num2, '*': num1 * num2 };
        const answer = answerMap[operation];
        const challengeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        this.challenges.set(challengeId, { answer, expiresAt: Date.now() + 300000, attempts: 0 });

        return { challengeId, question: `${num1} ${operation} ${num2} = ?`, expiresAt: Date.now() + 300000 };
    }

    verifyChallenge(challengeId, answer, ip) {
        if (!this.challenges.has(challengeId)) {
            return { valid: false, reason: 'Invalid or expired challenge' };
        }

        const challenge = this.challenges.get(challengeId);

        if (Date.now() > challenge.expiresAt) {
            this.challenges.delete(challengeId);
            return { valid: false, reason: 'Challenge expired' };
        }

        challenge.attempts++;
        if (challenge.attempts > 3) {
            this.challenges.delete(challengeId);
            rateLimiter.markSuspicious(ip, 'Multiple failed CAPTCHA attempts');
            return { valid: false, reason: 'Too many attempts' };
        }

        if (parseInt(answer) === challenge.answer) {
            this.challenges.delete(challengeId);
            return { valid: true };
        }

        return { valid: false, reason: 'Incorrect answer' };
    }

    cleanup() {
        const now = Date.now();
        for (const [id, challenge] of this.challenges) {
            if (now > challenge.expiresAt) this.challenges.delete(id);
        }
    }
}

const captchaService = new CaptchaService();

const validateHoneypot = (req, res, next) => {
    const honeypotFields = ['website', 'url', 'homepage', 'phone_number'];
    for (const field of honeypotFields) {
        if (req.body[field]) {
            rateLimiter.markSuspicious(req.ip, 'Honeypot field filled');
            logger.logSuspicious('Bot detected via honeypot', { ip: req.ip, field });
            return res.json({ success: true, message: 'Request processed' });
        }
    }
    next();
};

const validateSubmissionTime = (req, res, next) => {
    const { formLoadTime } = req.body;
    if (formLoadTime) {
        const timeTaken = Date.now() - parseInt(formLoadTime);
        if (timeTaken < 2000) {
            rateLimiter.markSuspicious(req.ip, 'Form submitted too quickly');
            logger.logSuspicious('Potential bot - form submitted too fast', { ip: req.ip, timeTaken: `${timeTaken}ms` });
            return res.json({ success: true, message: 'Request processed' });
        }
    }
    next();
};

const requireCaptcha = (req, res, next) => {
    const ip = req.ip;

    if (rateLimiter.suspiciousIPs.has(ip)) {
        const { challengeId, answer } = req.body;

        if (!challengeId || !answer) {
            const challenge = captchaService.generateChallenge();
            logger.info('CAPTCHA required for suspicious IP', { ip });
            return res.status(403).json({
                error: 'CAPTCHA verification required',
                captchaRequired: true,
                challenge: { id: challenge.challengeId, question: challenge.question }
            });
        }

        const verification = captchaService.verifyChallenge(challengeId, answer, ip);
        if (!verification.valid) {
            const challenge = captchaService.generateChallenge();
            return res.status(403).json({
                error: verification.reason,
                captchaRequired: true,
                challenge: { id: challenge.challengeId, question: challenge.question }
            });
        }

        logger.info('CAPTCHA verification passed', { ip });
    }

    next();
};

module.exports = { captchaService, requireCaptcha, validateHoneypot, validateSubmissionTime };
