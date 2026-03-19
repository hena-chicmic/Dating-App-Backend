const reportRepository = require('../repositories/report.repository');
const userRepository = require('../repositories/user.repository');

const reportUser = async (reporterId, reportedUserId, reason, description) => {

    if (!reportedUserId || !reason) {
        throw new Error('Reported user ID and reason are required.');
    }

    if (reporterId === parseInt(reportedUserId)) {
        throw new Error('You cannot report yourself.');
    }

    const reportedUser = await userRepository.getMyProfile(reportedUserId);
    if (!reportedUser) {
        throw new Error('The user you are trying to report does not exist.');
    }

    return await reportRepository.createReportAndBlock(reporterId, reportedUserId, reason, description);
};

const getReport = async (reportId) => {
    const report = await reportRepository.getReportById(reportId);
    if (!report) {
        throw new Error('Report not found.');
    }
    return report;
};

const getMyReports = async (userId) => {
    return await reportRepository.getReportsByReporter(userId);
};

module.exports = {
    reportUser,
    getReport,
    getMyReports
};
