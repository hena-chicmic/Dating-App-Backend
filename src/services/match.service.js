const matchRepository = require('../repositories/match.repository');
const { getIO } = require('../config/socket');
const onlineUsers = require('../socket/online-users');
const notificationService = require('./notification.service');
const cache = require('../utils/cache');

const TTL_MATCHES = 2 * 60;

const checkAndCreateMatch = async (userId, targetUserId) => {

    const isMutual = await matchRepository.checkMutualLike(userId, targetUserId);

    if (isMutual) {
        const newMatch = await matchRepository.createMatch(userId, targetUserId);

        if (newMatch) {
            try {
                const io = getIO();
                const payload = { matchId: newMatch.id, matchedWith: null };

                const socketA = await onlineUsers.get(parseInt(userId));
                if (socketA) io.to(socketA).emit('new_match', { ...payload, matchedWith: targetUserId });

                const socketB = await onlineUsers.get(parseInt(targetUserId));
                if (socketB) io.to(socketB).emit('new_match', { ...payload, matchedWith: userId });
            } catch (err) {

                console.error('Socket emit error on new match:', err.message);
            }

            try {
                await notificationService.createNotifications(userId, 'new_match', newMatch.id, "You have a new match!");
                await notificationService.createNotifications(targetUserId, 'new_match', newMatch.id, "You have a new match!");
            } catch (err) {
                console.error('Notification creation error on new match:', err.message);
            }

            await cache.del(`user:${userId}:matches`);
            await cache.del(`user:${targetUserId}:matches`);
        }
        return newMatch;
    }

    return null;
};

const getMatches = async (userId) => {
    const key = `user:${userId}:matches`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const matches = await matchRepository.fetchUserMatches(userId);
    await cache.set(key, matches, TTL_MATCHES);
    return matches;
};

module.exports = {
    checkAndCreateMatch,
    getMatches
};
