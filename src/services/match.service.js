const matchRepository = require('../repositories/match.repository');

const checkAndCreateMatch = async (userId, targetUserId) => {
    // 1. Check if the target user ALREADY liked the current user
    const isMutual = await matchRepository.checkMutualLike(userId, targetUserId);

    // 2. If mutual, create the match!
    if (isMutual) {
        const newMatch = await matchRepository.createMatch(userId, targetUserId);
        
        if (newMatch) {
            // TODO: In the future, trigger the NotificationService here!
            // console.log(`IT'S A MATCH! Users ${userId} and ${targetUserId}`);
        }
        return newMatch;
    }

    return null;
};

const getMatches = async (userId) => {
    const matches = await matchRepository.fetchUserMatches(userId);
    return matches;
};

module.exports = {
    checkAndCreateMatch,
    getMatches
};
