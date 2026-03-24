const matchRepository = require('../repositories/match.repository');
const { getIO } = require('../config/socket');
const onlineUsers = require('../socket/online-users');
const notificationService = require('./notification.service');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const TTL_MATCHES = 2 * 60;

const checkAndCreateMatch = async (userId, targetUserId) => {
    // Check if a match already exists for this pair to prevent race conditions
    const existingMatch = await matchRepository.findExistingMatch(userId, targetUserId);
    if (existingMatch) {
        logger.info(`Skipped duplicate match creation for users ${userId} and ${targetUserId}`);
        return existingMatch;
    }

    const isMutual = await matchRepository.checkMutualLike(userId, targetUserId);

    if (isMutual) {
        const newMatch = await matchRepository.createMatch(userId, targetUserId);

        if (newMatch) {
            try {
                const io = getIO();
                const payload = { matchId: newMatch.id, matchedWith: null };

                const socketA = await onlineUsers.get(userId.toString());
                if (socketA) io.to(socketA).emit('new_match', { ...payload, matchedWith: targetUserId });

                const socketB = await onlineUsers.get(targetUserId.toString());
                if (socketB) io.to(socketB).emit('new_match', { ...payload, matchedWith: userId });
            } catch (err) {
                logger.error(`Socket emit error on new match: ${err.message}`);
            }

            try {
                const { addNotificationJob } = require('../queues');
                await addNotificationJob(userId, 'new_match', newMatch.id, "You have a new match!");
                await addNotificationJob(targetUserId, 'new_match', newMatch.id, "You have a new match!");
            } catch (err) {
                logger.error(`Failed to queue notification jobs for match ${newMatch.id}: ${err.message}`);
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
