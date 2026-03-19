const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const notificationService = require('../services/notification.service');

const notificationWorker = new Worker('notification-queue', async (job) => {
    console.log(`[Queue] Processing job ${job.id} of type ${job.name}...`);

    if (job.name === 'send-notification') {
        const { userId, type, referenceId, message } = job.data;

        await notificationService.createNotifications(userId, type, referenceId, message);
    }
}, {
    connection: getRedisClient(),
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000
    }
});

notificationWorker.on('completed', job => {
    console.log(`[Queue] Notification job ${job.id} successfully completed`);
});

notificationWorker.on('failed', (job, err) => {
    console.error(`[Queue] Notification job ${job.id} failed:`, err.message);
});

module.exports = notificationWorker;
