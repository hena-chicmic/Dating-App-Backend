const notificationQueue = require('./notification.queue');
const matchQueue = require('./match.queue');

/**
 * 1. Team Coordination Index
 * We export all helper methods here so the rest of the app 
 * only needs to import from '@/queues'.
 */
module.exports = {
    ...notificationQueue,
    ...matchQueue,
};
