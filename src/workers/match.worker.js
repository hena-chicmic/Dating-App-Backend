const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const matchService = require('../services/match.service');
const logger = require('../utils/logger').child({ component: 'MatchWorker' });

const matchWorker = new Worker('match-queue', async (job) => {
    logger.info(`Processing job ${job.id} (type: ${job.name})`);

    try {
        if (job.name === 'check-mutual-match') {
            const { userId, targetUserId } = job.data;
            await matchService.checkAndCreateMatch(userId, targetUserId);
        }
    } catch (err) {
        logger.error(`MatchWorker ERROR [Job ${job.id}]: ${err.message}`);
        throw err;
    }
}, {
    connection: getRedisClient(),
    concurrency: 2
});

matchWorker.on('completed', job => {
    logger.info(`Match job ${job.id} successfully completed`);
});

matchWorker.on('failed', (job, err) => {
    logger.error(`Match job ${job?.id} failed: ${err.message}`);
});

module.exports = matchWorker;
