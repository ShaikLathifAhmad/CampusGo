const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat — campus chatbot Q&A
router.post('/', chatController.chat);

module.exports = router;
