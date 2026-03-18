const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const matchRepository = require('../repositories/match.repository');
const { getIO } = require('../config/socket');
const onlineUsers = require('../socket/online-users');
const { addNotificationJob } = require('../queues/notification.queue');
const cache = require('../utils/cache');

/**
 * Worker: Handles background match creation and alerting.
 */
const matchWorker = new Worker('match-queue', async (job) => {
    console.log(`[Queue] Processing job ${job.id} of type ${job.name}...`);

    if (job.name === 'check-mutual-match') {
        const { userId, targetUserId } = job.data;
        
        try {
            const isMutual = await matchRepository.checkMutualLike(userId, targetUserId);

        if (isMutual) {
            const newMatch = await matchRepository.createMatch(userId, targetUserId);

            if (newMatch) {
                console.log(`[Worker] Matching Logic: SUCCESS. Match ID: ${newMatch.id}`);

                // Real-time socket alerts
                // NOTE: This requires Socket.io Redis Adapter to work across processes!
                // Currently safely fails with 'Socket not initialized' since it's in a separate process
                try {
                    const io = getIO();
                    const payload = { matchId: newMatch.id, matchedWith: null };

                    const socketA = await onlineUsers.get(parseInt(userId));
                    if (socketA) io.to(socketA).emit('new_match', { ...payload, matchedWith: targetUserId });

                    const socketB = await onlineUsers.get(parseInt(targetUserId));
                    if (socketB) io.to(socketB).emit('new_match', { ...payload, matchedWith: userId });
                } catch (socketErr) {
                    console.error('[Worker] Socket alert failed (Redis Adapter recommended):', socketErr.message);
                }

                // Push asynchronous notification jobs
                await addNotificationJob(userId, 'new_match', newMatch.id, "You have a new match!");
                await addNotificationJob(targetUserId, 'new_match', newMatch.id, "You have a new match!");

                // Invalidate local cache
                await cache.del(`user:${userId}:matches`);
                await cache.del(`user:${targetUserId}:matches`);
            }
        }
    } catch (err) {
        console.error(`[Worker] MatchWorker ERROR [Job ${job.id}]:`, err.message);
        throw err;
    }
    }
}, {
    connection: getRedisClient(),
    concurrency: 2 
});

matchWorker.on('completed', job => {
    console.log(`[Queue] Match job ${job.id} successfully completed`);
});

matchWorker.on('failed', (job, err) => {
    console.error(`[Queue] Match job ${job.id} failed:`, err.message);
});

module.exports = matchWorker;
