const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const matchQueue = new Queue('match-queue', {
    connection: getRedisClient()
});

const logger = require('../utils/logger').child({ component: 'MatchQueue' });

const addMatchJob = async (userId, targetUserId) => {
    try {
        await matchQueue.add('check-mutual-match', {
            userId,
            targetUserId,
        }, {

            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: 500
        });

        logger.info(`Match check job queued for users: ${userId} & ${targetUserId}`);
    } catch (err) {
        logger.error(`Error adding job to match-queue: ${err.message}`);
    }
};

module.exports = {
    matchQueue,
    addMatchJob,
};
