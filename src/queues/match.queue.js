const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

// 1. Connect to our shared Redis pool
const connection = getRedisClient();

/**
 * 2. Define the Match Queue
 * This queue handles the job of "Checking if two users now match"
 */
const matchQueue = new Queue('matchQueue', {
    connection,
});

/**
 * 3. Publisher: Adds a mutual match check job to the queue.
 * This is called by the Interaction Service whenever a user 'likes' another.
 */
const addMatchJob = async (userId, targetUserId) => {
    try {
        await matchQueue.add('checkMutualMatch', {
            userId,
            targetUserId,
        }, {
            // Options:
            attempts: 2, 
            removeOnComplete: true,
            removeOnFail: 500
        });
        
        console.log(`[Queue] Match check job queued for users: ${userId} & ${targetUserId}`);
    } catch (err) {
        console.error('[Queue] Error adding job to matchQueue:', err.message);
    }
};

module.exports = {
    addMatchJob,
};
