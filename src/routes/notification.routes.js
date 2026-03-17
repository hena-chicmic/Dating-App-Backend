const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require("../middleware/auth.middleware");
const validate = require('../middleware/validation.middleware');
const { notificationIdParamSchema } = require('../validations/notification.validation');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification operations
 */

/**
 * @swagger
 * /notifications/read:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 */
router.get('/read', notificationController.getNotifications);

/**
 * @swagger
 * /notifications/mark-read/{notification_id}:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 */
router.patch('/mark-read/:notification_id', validate(notificationIdParamSchema, 'params'), notificationController.markRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 */
router.patch('/mark-all-read', notificationController.markAllRead);

module.exports = router;
