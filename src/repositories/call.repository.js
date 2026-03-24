const CallLog = require('../models/callLog.model');

class CallRepository {
    async createCallLog({ matchId, callerId, receiverId }) {
        const callLog = new CallLog({
            match_id: matchId,
            caller_id: callerId,
            receiver_id: receiverId,
            status: 'initiated'
        });
        const savedLog = await callLog.save();
        return savedLog._id;
    }

    async updateCallStatus(callId, status) {
        const updateData = { status };
        
        if (status === 'ongoing') {
            updateData.started_at = new Date();
        } else if (['completed', 'missed', 'rejected'].includes(status)) {
            updateData.ended_at = new Date();
        }

        const callLog = await CallLog.findByIdAndUpdate(
            callId, 
            { $set: updateData }, 
            { new: true }
        );

        // If completed, calculate duration natively since started_at is now available
        if (status === 'completed' && callLog.started_at && callLog.ended_at) {
            const durationSecs = Math.floor((callLog.ended_at - callLog.started_at) / 1000);
            callLog.duration = durationSecs;
            await callLog.save();
        }

        return callLog;
    }

    async getCallHistory(matchId, limit = 50, offset = 0) {
        const logs = await CallLog.find({ match_id: matchId })
            .populate('caller_id', 'username')
            .populate('receiver_id', 'username')
            .sort({ created_at: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
        
        return logs.map(log => ({
            ...log,
            caller_name: log.caller_id?.username,
            receiver_name: log.receiver_id?.username
        }));
    }
}

module.exports = new CallRepository();
