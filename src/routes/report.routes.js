const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/create-report', reportController.reportUser);

router.get('/report-history', reportController.getMyReports);

router.get('/:id', reportController.getReport);

module.exports = router;
