const discoveryRepository = require('../repositories/discovery.repository');
const cache = require('../utils/cache');
const { CACHE, DISCOVERY } = require('../utils/constants');

const getFeed = async (userId, page = 1) => {
    const key = `feed:${userId}:page:${page}`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const limit = DISCOVERY.DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;
    const recommendations = await discoveryRepository.findRecommendations(userId, limit, offset);

    await cache.set(key, recommendations, CACHE.FEED_TTL_SECONDS);
    return recommendations;
};

const invalidateFeed = async (userId) => {
    await cache.delByPattern(`feed:${userId}:*`);
};

module.exports = {
    getFeed,
    invalidateFeed
};
