const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createReportSchema, reportIdParamSchema } = require('../validations/report.validation');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: User reporting operations
 */

/**
 * @swagger
 * /reports/create-report:
 *   post:
 *     summary: Report a user for misconduct
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Report submitted successfully
 */
router.post('/create-report', validate(createReportSchema), reportController.reportUser);

/**
 * @swagger
 * /reports/report-history:
 *   get:
 *     summary: Get all reports submitted by the current user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved report history
 */
router.get('/report-history', reportController.getMyReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get details of a specific report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the report details
 */
router.get('/:id', validate(reportIdParamSchema, 'params'), reportController.getReport);

module.exports = router;
