const {Queue} = require('bullmq');
const {getRedisClient} = require('../config/redis');

const emailQueue = new Queue('email-queue', {
    connection: getRedisClient()
});

const queueVerificationEmail = async(email, otp) => {
    await emailQueue.add('verification-email', {email, otp});
}

const queuePasswordResetEmail = async(email, otp) => {
    await emailQueue.add('password-reset-email', {email, otp});
}

module.exports = {
    queueVerificationEmail,
    queuePasswordResetEmail
};
