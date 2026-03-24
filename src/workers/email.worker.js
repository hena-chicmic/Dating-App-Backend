const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const emailService = require('../services/email.service');
const logger = require('../utils/logger').child({ component: 'EmailWorker' });

const emailWorker = new Worker('email-queue', async (job) => {
    logger.info(`[Queue] Processing job ${job.id} of type ${job.name}...`);

    try {
        if (job.name === 'verification-email') {
            const { email, otp } = job.data;
            await emailService.sendVerificationEmail(email, otp);
        }
        else if (job.name === 'password-reset-email') {
            const { email, otp } = job.data;
            await emailService.sendPasswordResetEmail(email, otp);
        }
    } catch (error) {
        logger.error(`Error in Email Worker for ${job.name}: ${error.message}`);
        throw error;
    }
}, {
    connection: getRedisClient(),
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 5000
    }
});

emailWorker.on('completed', job => {
    logger.info(`[Queue] Email job ${job.id} successfully completed`);
});

emailWorker.on('failed', (job, err) => {
    logger.error(`[Queue] Email job ${job?.id} failed: ${err.message}`);
});

module.exports = emailWorker;
