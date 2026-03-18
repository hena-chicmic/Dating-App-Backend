const { getRedisClient } = require('../config/redis');

/**
 * Manages online users using Redis for production scalability.
 * Key: online_user:<userId>
 * Value: <socketId>
 */
const onlineUsers = {
    set: async (userId, socketId) => {
        const redis = getRedisClient();
        if (redis) {
            await redis.set(`online_user:${userId}`, socketId, 'EX', 86400); // 24h expiry
        }
    },
    get: async (userId) => {
        const redis = getRedisClient();
        if (redis) {
            return await redis.get(`online_user:${userId}`);
        }
        return null;
    },
    delete: async (userId) => {
        const redis = getRedisClient();
        if (redis) {
            await redis.del(`online_user:${userId}`);
        }
    },
    // For checking existence
    has: async (userId) => {
        const redis = getRedisClient();
        if (redis) {
            const exists = await redis.exists(`online_user:${userId}`);
            return exists === 1;
        }
        return false;
    }
};

module.exports = onlineUsers;
