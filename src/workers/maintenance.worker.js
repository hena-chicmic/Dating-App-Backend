const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const maintenanceRepository = require('../repositories/maintenance.repository');
const logger = require('../utils/logger').child({ component: 'MaintenanceWorker' });

const maintenanceWorker = new Worker('maintenance-queue', async (job) => {
    logger.info(`Starting maintenance task: ${job.name}`);

    try {
        if (job.name === 'cleanup-tokens') {
            const count = await maintenanceRepository.cleanupExpiredRefreshTokens();
            logger.info(`Cleaned up ${count} expired refresh tokens`);
        } 
        else if (job.name === 'cleanup-otps') {
            const emailCount = await maintenanceRepository.cleanupExpiredEmailVerifications();
            const passCount = await maintenanceRepository.cleanupExpiredPasswordResets();
            logger.info(`Cleaned up ${emailCount} verification OTPs and ${passCount} reset OTPs`);
        }
    } catch (error) {
        logger.error(`Maintenance task ${job.name} failed: ${error.message}`);
        throw error;
    }
}, { 
    connection: getRedisClient() 
});

module.exports = maintenanceWorker;
