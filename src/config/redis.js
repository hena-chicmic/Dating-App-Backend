const Redis = require('ioredis');

let redisClient;

const getRedisClient = () => {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                if (times > 3) {
                    console.warn('Redis connection failed after 3 retries. Caching disabled.');
                    return null; // stop retrying
                }
                return Math.min(times * 200, 2000);
            }
        });
        
        redisClient.on('connect', () => console.log('✅ Redis connected'));
        redisClient.on('error', (err) => console.warn('⚠️  Redis error:', err.message));
    }
    return redisClient;
};

module.exports = { getRedisClient };
