const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');
const isAuthenticated = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Calls
 *   description: Video and Voice call history tracking
 */

router.use(isAuthenticated);

/**
 * @swagger
 * /api/v1/calls/history/{matchId}:
 *   get:
 *     summary: Retrieve call history for a specific match
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the match between two users
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
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Call history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       match_id:
 *                         type: integer
 *                         example: 45
 *                       caller_id:
 *                         type: integer
 *                         example: 3
 *                       receiver_id:
 *                         type: integer
 *                         example: 8
 *                       status:
 *                         type: string
 *                         enum: [initiated, ongoing, missed, rejected, completed]
 *                         example: completed
 *                       duration:
 *                         type: integer
 *                         description: Duration of the call in seconds
 *                         example: 135
 *                       started_at:
 *                         type: string
 *                         format: date-time
 *                       ended_at:
 *                         type: string
 *                         format: date-time
 *                       caller_name:
 *                         type: string
 *                         example: "john_doe"
 *                       receiver_name:
 *                         type: string
 *                         example: "jane_doe"
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer Token.
 *       500:
 *         description: Internal Server Error
 */
router.get('/history/:matchId', callController.getCallHistory);

module.exports = router;
