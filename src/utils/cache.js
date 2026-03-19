const { getRedisClient } = require('../config/redis');

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

const set = async (key, value, ttlSeconds = 300) => {
    try {
        const client = getRedisClient();
        await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        console.warn(`Cache SET error [${key}]:`, err.message);
    }
};

const del = async (key) => {
    try {
        const client = getRedisClient();
        await client.del(key);
    } catch (err) {
        console.warn(`Cache DEL error [${key}]:`, err.message);
    }
};

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
