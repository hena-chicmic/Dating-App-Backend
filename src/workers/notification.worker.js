const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger').child({ component: 'NotificationWorker' });

const notificationWorker = new Worker('notification-queue', async (job) => {
    const { userId, type, referenceId, message } = job.data;
    logger.info(`Processing ${type} notification for user ${userId}`);

    try {
        await notificationService.createNotifications(userId, type, referenceId, message);
    } catch (error) {
        logger.error(`Error sending notification to user ${userId}: ${error.message}`);
        throw error;
    }
}, { connection: getRedisClient() });

notificationWorker.on('completed', job => {
    logger.info(`Notification job ${job.id} successfully completed`);
});

notificationWorker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed: ${err.message}`);
});

module.exports = notificationWorker;
