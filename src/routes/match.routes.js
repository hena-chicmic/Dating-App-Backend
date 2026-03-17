const express = require('express');
const router = express.Router();
const { getUserMatches } = require('../controllers/match.controller');
const isAuthenticated = require('../middleware/auth.middleware');

<<<<<<< HEAD
=======
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
>>>>>>> 7cf74c9 (swagger and media upload done)
router.get('/', isAuthenticated, getUserMatches);

module.exports = router;
