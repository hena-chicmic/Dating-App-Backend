const express = require('express');
const router = express.Router();
const { getUserMatches } = require('../controllers/match.controller');
const isAuthenticated = require('../middleware/auth.middleware');

router.get('/', isAuthenticated, getUserMatches);

module.exports = router;
