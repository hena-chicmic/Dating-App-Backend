const notificationRepository = require('../repositories/notification.repository');
const cache = require('../utils/cache');

const TTL_NOTIFICATIONS = 60; // 60 seconds

const getNotifications = async (userId) => {
    const key = `user:${userId}:notifications`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const notifications = await notificationRepository.getNotifications(userId);
    await cache.set(key, notifications, TTL_NOTIFICATIONS);
    return notifications;
};

const markRead = async (userId, notification_id) => {
    const result = await notificationRepository.markRead(userId, notification_id);
    await cache.del(`user:${userId}:notifications`);
    return result;
};

const markAllRead = async (userId) => {
    const result = await notificationRepository.markAllRead(userId);
    await cache.del(`user:${userId}:notifications`);
    return result;
};

const createNotifications = async (userId, type, reference_id, message) => {
    const result = await notificationRepository.createNotifications(userId, type, reference_id, message);
    await cache.del(`user:${userId}:notifications`);
    return result;
};

module.exports = {
    getNotifications,
    markRead,
    markAllRead,
    createNotifications
};