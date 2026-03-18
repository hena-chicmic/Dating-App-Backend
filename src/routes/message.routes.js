const express = require('express');
const router = express.Router();
const { getChatHistory, markRead, deleteMessage } = require('../controllers/message.controller');
const isAuthenticated = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { matchIdParamSchema, messageIdParamSchema, getChatQuerySchema } = require('../validations/message.validation');

router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: User messaging operations
 */

/**
 * @swagger
 * /messages/{matchId}:
 *   get:
 *     summary: Get chat history for a match
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Successfully retrieved chat history
 */
router.get('/:matchId', validate(matchIdParamSchema, 'params'), validate(getChatQuerySchema, 'query'), getChatHistory);

/**
 * @swagger
 * /messages/{matchId}/read:
 *   patch:
 *     summary: Mark messages as read for a match
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.patch('/:matchId/read', validate(matchIdParamSchema, 'params'), markRead);

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Delete a specific message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted the message
 */
router.delete('/:messageId', validate(messageIdParamSchema, 'params'), deleteMessage);

module.exports = router;
