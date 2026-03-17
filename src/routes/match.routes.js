const express = require('express');
const router = express.Router();
const { getUserMatches } = require('../controllers/match.controller');
const isAuthenticated = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: User match operations
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all successful matches for the current user
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches retrieved successfully
 */
router.get('/', isAuthenticated, getUserMatches);

module.exports = router;
