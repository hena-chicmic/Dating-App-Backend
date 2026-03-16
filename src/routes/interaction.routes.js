const express = require('express');
const router = express.Router();
const { swipe, getSentLikes, getReceivedLikes } = require('../controllers/interaction.controller');
const isAuthenticated = require('../middleware/auth.middleware');

// Record a 'like' or 'dislike' on a profile
router.post('/swipe', isAuthenticated, swipe);

// View profiles you have liked
router.get('/likes/sent', isAuthenticated, getSentLikes);

// View profiles who have liked you
router.get('/likes/received', isAuthenticated, getReceivedLikes);

module.exports = router;
