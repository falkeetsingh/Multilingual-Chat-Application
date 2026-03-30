const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/chat/:chatId', authMiddleware, messageController.listMessages);
router.post('/:messageId/translate', authMiddleware, messageController.translateMessage);

module.exports = router;
