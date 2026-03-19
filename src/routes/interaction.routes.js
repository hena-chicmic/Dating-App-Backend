const express = require('express');
const router = express.Router();
const { swipe, getSentLikes, getReceivedLikes, unblockUser, blockUser } = require('../controllers/interaction.controller');
const isAuthenticated = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { swipeSchema } = require('../validations/interaction.validation');
const { swipeLimiter } = require('../middleware/rateLimiter.middleware');

/**
 * @swagger
 * tags:
 *   name: Interactions
 *   description: User swipe and matching operations
 */

/**
 * @swagger
 * /interactions/swipe:
 *   post:
 *     summary: Swipe on a user profile (like/dislike)
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - action
 *             properties:
 *               targetUserId:
 *                 type: integer
 *               action:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Interaction recorded successfully
 *       400:
 *         description: Validation or business logic error
 */
router.post('/swipe', isAuthenticated, swipeLimiter, validate(swipeSchema), swipe);

/**
 * @swagger
 * /interactions/likes/sent:
 *   get:
 *     summary: Get profiles that the current user has liked
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent likes
 */
router.get('/likes/sent', isAuthenticated, getSentLikes);

/**
 * @swagger
 * /interactions/likes/received:
 *   get:
 *     summary: Get profiles that have liked the current user
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received likes
 */
router.get('/likes/received', isAuthenticated, getReceivedLikes);

/**
 * @swagger
 * /interactions/blocks/{targetUserId}:
 *   delete:
 *     summary: Unblock a previously blocked user
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User unblocked successfully
 */
router.delete('/blocks/:targetUserId', isAuthenticated, unblockUser);

/**
 * @swagger
 * /interactions/blocks/{targetUserId}:
 *   post:
 *     summary: Block a user without reporting
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         description: The ID of the user to block.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User blocked successfully
 */
router.post('/blocks/:targetUserId', isAuthenticated, blockUser);

module.exports = router;
