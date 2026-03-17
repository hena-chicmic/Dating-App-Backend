const reportService = require('../services/report.service');


const reportUser = async (req, res, next) => {
    try {
        const reporterId = req.user.id;
        const { reportedUserId, reason, description } = req.body;

        const report = await reportService.reportUser(reporterId, reportedUserId, reason, description);

        res.status(201).json({
            success: true,
            message: 'User reported and blocked successfully.',
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const getReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await reportService.getReport(id);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};


const getMyReports = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reports = await reportService.getMyReports(userId);

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    reportUser,
    getReport,
    getMyReports
};