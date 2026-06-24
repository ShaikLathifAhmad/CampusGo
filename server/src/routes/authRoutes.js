const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { validateHoneypot, validateSubmissionTime } = require('../middleware/captchaMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/register', validateHoneypot, validateSubmissionTime, authController.register);
router.post('/login', validateHoneypot, validateSubmissionTime, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.get('/me', authMiddleware, authController.getMe);

// Admin routes — protected by JWT + admin role check
router.get('/admin/abuse-stats', authMiddleware, adminMiddleware, (req, res) => {
    res.json(rateLimiter.getStats());
});

router.post('/admin/unblock-ip', authMiddleware, adminMiddleware, (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP address required' });
    rateLimiter.unblockIP(ip);
    res.json({ success: true, message: `IP ${ip} has been unblocked` });
});

module.exports = router;
