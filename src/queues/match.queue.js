const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

// Initialize the Match Queue using the shared Redis connection
const matchQueue = new Queue('match-queue', {
    connection: getRedisClient()
});

/**
 * Publisher: Adds a mutual match check job to the queue.
 * Handled asynchronously when a user 'likes' another.
 */
const addMatchJob = async (userId, targetUserId) => {
    try {
        await matchQueue.add('check-mutual-match', {
            userId,
            targetUserId,
        }, {
            // Teammate's retry strategy
            attempts: 3, 
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: 500
        });
        
        console.log(`[Queue] Match check job queued for users: ${userId} & ${targetUserId}`);
    } catch (err) {
        console.error('[Queue] Error adding job to match-queue:', err.message);
    }
};

module.exports = {
    matchQueue,
    addMatchJob,
};
