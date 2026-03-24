const { mongoose } = require('../config/db');
const Report = require('../models/report.model');
const Block = require('../models/block.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');

const createReportAndBlock = async (reporterId, reportedUserId, reason, description) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Create the Report
        const report = new Report({
            reporter_id: reporterId,
            reported_user_id: reportedUserId,
            reason,
            description
        });
        await report.save({ session });

        // 2. Create the Block (Upsert)
        await Block.findOneAndUpdate(
            { blocker_id: reporterId, blocked_id: reportedUserId },
            { blocker_id: reporterId, blocked_id: reportedUserId },
            { upsert: true, new: true, session }
        );

        // 3. Deactivate any existing Match
        await Match.updateMany(
            {
                $or: [
                    { user1_id: reporterId, user2_id: reportedUserId },
                    { user1_id: reportedUserId, user2_id: reporterId }
                ]
            },
            { status: 'deactivated' },
            { session }
        );

        // 4. Check report threshold for auto-ban
        const reportCount = await Report.distinct('reporter_id', { 
            reported_user_id: reportedUserId 
        }).session(session);
        
        if (reportCount.length >= 5) {
            await User.findByIdAndUpdate(reportedUserId, {
                is_banned: true,
                is_active: false
            }, { session });
        }

        await session.commitTransaction();
        return report;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getReportById = async (reportId) => {
    return await Report.findById(reportId)
        .populate('reporter_id', 'username')
        .populate('reported_user_id', 'username')
        .lean();
};

const getReportsByReporter = async (reporterId) => {
    return await Report.find({ reporter_id: reporterId })
        .populate('reported_user_id', 'username')
        .sort({ createdAt: -1 })
        .lean();
};

module.exports = {
    createReportAndBlock,
    getReportById,
    getReportsByReporter
};
