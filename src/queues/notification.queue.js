const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const notificationQueue = new Queue('notification-queue', {
    connection: getRedisClient()
});

/**
 * Publisher: Adds a notification job to the queue.
 */
const addNotificationJob = async (userId, type, referenceId, message) => {
    await notificationQueue.add('send-notification', { userId, type, referenceId, message });
};

module.exports = {
    notificationQueue,
    addNotificationJob
};
