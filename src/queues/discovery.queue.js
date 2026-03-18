const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const discoveryQueue = new Queue('discovery-queue', {
    connection: getRedisClient()
});

const queueProfileRecalculation = async (userId) => {
    await discoveryQueue.add('recalculate-profile', { userId });
};

module.exports = {
    discoveryQueue,
    queueProfileRecalculation
};
