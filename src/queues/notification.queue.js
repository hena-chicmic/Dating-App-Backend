const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

// 1. Connect to the existing Redis client
const connection = getRedisClient();

/**
 * 2. Define the Queue instance.
 * The 'notificationQueue' name must match in both the producer and the worker.
 */
const notificationQueue = new Queue('notificationQueue', {
    connection,
});

/**
 * 3. Helper function to "produce" or "publish" a job.
 * Instead of waiting for the DB, the service will call this and return immediately.
 */
const addNotificationJob = async (userId, type, reference_id, message) => {
    try {
        await notificationQueue.add('sendNotification', {
            userId,
            type,
            reference_id,
            message,
        }, {
            // RETRY STRATEGY: If the DB is down, retry 3 times with exponential delay
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true, // Clean up Redis once done
        });
        console.log(`[Queue] Job queued for user: ${userId}`);
    } catch (err) {
        console.error('[Queue] Failed to add notification job:', err.message);
    }
};

module.exports = {
    addNotificationJob,
};
