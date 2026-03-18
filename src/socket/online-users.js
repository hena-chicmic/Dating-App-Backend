const { getRedisClient } = require('../config/redis');

/**
 * Shared Online User tracking via Redis.
 * Essential for Microservice architecture so both API and Workers 
 * see the same status.
 */
const onlineUsers = {
    set: async (userId, socketId) => {
        const redis = getRedisClient();
        console.log(`[Presence] Setting user ${userId} to socket ${socketId}`);
        await redis.set(`online:${userId}`, socketId, 'EX', 86400); // 24h expiry
    },
    get: async (userId) => {
        const redis = getRedisClient();
        return await redis.get(`online:${userId}`);
    },
    delete: async (userId) => {
        const redis = getRedisClient();
        console.log(`[Presence] Removing user ${userId}`);
        await redis.del(`online:${userId}`);
    },
    has: async (userId) => {
        const redis = getRedisClient();
        const exists = await redis.exists(`online:${userId}`);
        return exists === 1;
    }
};

module.exports = onlineUsers;
