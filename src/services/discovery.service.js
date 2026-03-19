const discoveryRepository = require('../repositories/discovery.repository');
const cache = require('../utils/cache');

const TTL_FEED = 2 * 60;

const getFeed = async (userId, page = 1) => {
    const key = `feed:${userId}:page:${page}`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const limit = 10;
    const offset = (page - 1) * limit;
    const recommendations = await discoveryRepository.findRecommendations(userId, limit, offset);

    await cache.set(key, recommendations, TTL_FEED);
    return recommendations;
};

const invalidateFeed = async (userId) => {
    await cache.delByPattern(`feed:${userId}:*`);
};

module.exports = {
    getFeed,
    invalidateFeed
};
