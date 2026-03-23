const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const maintenanceQueue = new Queue('maintenance-queue', {
    connection: getRedisClient()
});

const setupMaintenanceJobs = async () => {
    // 1. Cleanup expired refresh tokens every 6 hours
    await maintenanceQueue.add('cleanup-tokens', {}, {
        repeat: { pattern: '0 */6 * * *' }, // Every 6 hours
        removeOnComplete: true,
        removeOnFail: 1000
    });

    // 2. Cleanup expired OTPs every hour
    await maintenanceQueue.add('cleanup-otps', {}, {
        repeat: { pattern: '0 * * * *' }, // Every hour
        removeOnComplete: true,
        removeOnFail: 1000
    });
};

module.exports = {
    maintenanceQueue,
    setupMaintenanceJobs
};
