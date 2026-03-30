const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/', authMiddleware, chatController.listChats);
router.post('/direct', authMiddleware, chatController.createOrGetDirectChat);

module.exports = router;
