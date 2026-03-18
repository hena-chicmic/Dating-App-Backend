const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const notificationService = require('../services/notification.service');

// 1. Re-use the existing Redis connection
const connection = getRedisClient();

/**
 * 2. Define the Worker instance.
 * The name 'notificationQueue' MUST exactly match the one in the production file.
 * We also provide functionality for the background processor.
 */
const notificationWorker = new Worker('notificationQueue', async (job) => {
    // 3. Extract the data that was "pushed" by the service
    const { userId, type, reference_id, message } = job.data;
    
    console.log(`[Worker] Started processing notification job: ${job.id}`);
    
    try {
        // 4. PERFORM THE ACTUAL WORK: DB Insertion
        await notificationService.createNotifications(userId, type, reference_id, message);
        console.log(`[Worker] Notification successfully created for user: ${userId}`);
    } catch (err) {
        console.error(`[Worker] Error in job ${job.id}:`, err.message);
        // Throwing an error here triggers the 3 retries defined in the Queue
        throw err; 
    }
}, {
    connection,
    // Concurrency: 5 allows for high data processing throughput
    concurrency: 5 
});

// 5. Lifecycle Logging
notificationWorker.on('completed', (job) => {
    console.log(`[Worker] Notification job ${job.id} finished successfully.`);
});

notificationWorker.on('failed', (job, err) => {
    console.error(`[Worker] Notification job ${job.id} FAILED after all attempts: ${err.message}`);
});

module.exports = notificationWorker;
