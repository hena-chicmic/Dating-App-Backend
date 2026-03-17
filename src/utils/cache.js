const { getRedisClient } = require('../config/redis');

/**
 * Get a value from cache. Returns null if key not found or Redis is down.
 */
const get = async (key) => {
    try {
        const client = getRedisClient();
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.warn(`Cache GET error [${key}]:`, err.message);
        return null;
    }
};

/**
 * Store a value in cache with an optional TTL (seconds).
 */
const set = async (key, value, ttlSeconds = 300) => {
    try {
        const client = getRedisClient();
        await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        console.warn(`Cache SET error [${key}]:`, err.message);
    }
};

/**
 * Delete a specific cache key.
 */
const del = async (key) => {
    try {
        const client = getRedisClient();
        await client.del(key);
    } catch (err) {
        console.warn(`Cache DEL error [${key}]:`, err.message);
    }
};

/**
 * Delete all keys matching a pattern (e.g. "feed:123:*").
 */
const delByPattern = async (pattern) => {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch (err) {
        console.warn(`Cache DEL pattern error [${pattern}]:`, err.message);
    }
};

module.exports = { get, set, del, delByPattern };
