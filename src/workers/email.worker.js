const {Worker} = require('bullmq');
const {getRedisClient} = require('../config/redis');
const emailService = require('../services/email.service');

const emailWorker = new Worker('email-queue', async (job) => {
    console.log(`[Queue] Processing job ${job.id} of type ${job.name}...`);

    if (job.name === 'verification-email') {
        const { email, otp } = job.data;
        await emailService.sendVerificationEmail(email, otp);
    } 
    else if (job.name === 'password-reset-email') {
        const { email, otp } = job.data;
        await emailService.sendPasswordResetEmail(email, otp);
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
    console.log(`[Queue] Email job ${job.id} successfully completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[Queue] Email job ${job.id} failed:`, err.message);
}); 