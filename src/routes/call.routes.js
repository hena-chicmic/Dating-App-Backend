const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');
const isAuthenticated = require('../middleware/auth.middleware');

router.use(isAuthenticated);

router.get('/history/:matchId', callController.getCallHistory);

module.exports = router;
