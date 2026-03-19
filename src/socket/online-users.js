const { getRedisClient } = require('../config/redis');

const onlineUsers = {
    set: async (userId, socketId) => {
        const redis = getRedisClient();
        if (redis) {
            await redis.set(`online_user:${userId}`, socketId, 'EX', 86400);
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
