const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', authMiddleware, userController.listUsers);

module.exports = router;
