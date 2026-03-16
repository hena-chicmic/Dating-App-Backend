const express = require('express');
const router = express.Router();
const { getRecommendations, swipe } = require('../controllers/discovery.controller');
const isAuthenticated = require('../middleware/auth.middleware');

// Fetch 10 compatible, unseen profiles
router.get('/feed', isAuthenticated, getRecommendations);

module.exports = router;
