const express = require('express');
const router = express.Router();
const { getChatHistory, markRead, deleteMessage } = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/:matchId', getChatHistory);
router.patch('/:matchId/read', markRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;
