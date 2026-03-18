const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const matchRepository = require('../repositories/match.repository');
const { getIO } = require('../config/socket');
const onlineUsers = require('../socket/online-users');
const { addNotificationJob } = require('../queues/notification.queue');
const cache = require('../utils/cache');

const connection = getRedisClient();

/**
 * Worker: Handles background match creation and alerting.
 */
const matchWorker = new Worker('matchQueue', async (job) => {
    const { userId, targetUserId } = job.data;
    
    console.log(`[Worker] Started match check for users ${userId} & ${targetUserId}`);
    
    try {
        const isMutual = await matchRepository.checkMutualLike(userId, targetUserId);

        if (isMutual) {
            const newMatch = await matchRepository.createMatch(userId, targetUserId);

            if (newMatch) {
                console.log(`[Worker] Matching Logic: SUCCESS. Match ID: ${newMatch.id}`);

                // PRODUCTION FIX: The Redis Adapter allows this worker process 
                // to emit to sockets connected to the API process.
                try {
                    const io = getIO();
                    const payload = { matchId: newMatch.id, matchedWith: null };

                    // REDIS FIX: onlineUsers.get is now async
                    const socketA = await onlineUsers.get(parseInt(userId));
                    if (socketA) io.to(socketA).emit('new_match', { ...payload, matchedWith: targetUserId });

                    const socketB = await onlineUsers.get(parseInt(targetUserId));
                    if (socketB) io.to(socketB).emit('new_match', { ...payload, matchedWith: userId });
                } catch (socketErr) {
                    console.error('[Worker] Socket alert failed:', socketErr.message);
                }

                await addNotificationJob(userId, 'new_match', newMatch.id, "You have a new match!");
                await addNotificationJob(targetUserId, 'new_match', newMatch.id, "You have a new match!");

                await cache.del(`user:${userId}:matches`);
                await cache.del(`user:${targetUserId}:matches`);
            }
        }
    } catch (err) {
        console.error(`[Worker] MatchWorker ERROR [Job ${job.id}]:`, err.message);
        throw err;
    }
}, {
    connection,
    concurrency: 2 
});

module.exports = matchWorker;
