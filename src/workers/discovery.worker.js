const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const discoveryService = require('../services/discovery.service');

const discoveryWorker = new Worker('discovery-queue', async (job) => {
    console.log(`[Queue] Processing job ${job.id} of type ${job.name}...`);

    if (job.name === 'recalculate-profile') {
        const { userId } = job.data;

        console.log(`[Worker] Started heavy profile recalculation algorithm for User ${userId}...`);

        await discoveryService.invalidateFeed(userId);

        await discoveryService.getFeed(userId, 1);

        console.log(`[Worker] Successfully recalcuated and cached page 1 for User ${userId}`);
    }
}, {
    connection: getRedisClient(),
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 5000
    }
});

discoveryWorker.on('completed', job => {
    console.log(`[Queue] Discovery job ${job.id} successfully completed`);
});

discoveryWorker.on('failed', (job, err) => {
    console.error(`[Queue] Discovery job ${job.id} failed:`, err.message);
});

module.exports = discoveryWorker;
