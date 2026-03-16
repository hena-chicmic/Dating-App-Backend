const matchRepository = require('../repositories/match.repository');
const { getIO } = require('../config/socket');
const onlineUsers = require('../socket/online-users');

const checkAndCreateMatch = async (userId, targetUserId) => {
   
    const isMutual = await matchRepository.checkMutualLike(userId, targetUserId);

    if (isMutual) {
        const newMatch = await matchRepository.createMatch(userId, targetUserId);

        if (newMatch) {
            try {
                const io = getIO();
                const payload = { matchId: newMatch.id, matchedWith: null };

                const socketA = onlineUsers.get(parseInt(userId));
                if (socketA) io.to(socketA).emit('new_match', { ...payload, matchedWith: targetUserId });

                const socketB = onlineUsers.get(parseInt(targetUserId));
                if (socketB) io.to(socketB).emit('new_match', { ...payload, matchedWith: userId });
            } catch (err) {
                
                console.error('Socket emit error on new match:', err.message);
            }
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
