const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const notificationQueue = new Queue('notification-queue', {
    connection: getRedisClient()
});

const addNotificationJob = async (userId, type, referenceId, message) => {
    await notificationQueue.add('send-notification', { userId, type, referenceId, message });
};

module.exports = {
    notificationQueue,
    addNotificationJob
};
