const callRepository = require('../repositories/call.repository');
const { addNotificationJob } = require('../queues');

class CallService {
    async startCall(matchId, callerId, receiverId) {
        return await callRepository.createCallLog({ matchId, callerId, receiverId });
    }

    async updateStatus(callId, status) {
        const log = await callRepository.updateCallStatus(callId, status);

        if (status === 'missed') {
            try {
                await addNotificationJob(
                    log.receiver_id,
                    'missed_call',
                    log.match_id,
                    "You have a missed call."
                );
            } catch (err) {
                console.error('Failed to queue missed call notification:', err.message);
            }
        }

        return log;
    }

    async getHistory(matchId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        return await callRepository.getCallHistory(matchId, limit, offset);
    }
}

module.exports = new CallService();
