const express = require('express');
const router = express.Router();
const { getRecommendations, swipe } = require('../controllers/discovery.controller');
const isAuthenticated = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Discovery
 *   description: Profile discovery and recommendations
 */

/**
 * @swagger
 * /discovery/feed:
 *   get:
 *     summary: Get profile recommendations
 *     tags: [Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of recommended profiles
 */
router.get('/feed', isAuthenticated, getRecommendations);

module.exports = router;
