const discoveryRepository = require('../repositories/discovery.repository');
const matchService = require('./match.service');

const getFeed = async (userId, page = 1) => {
    const limit = 10;
    const offset = (page - 1) * limit;

    const recommendations = await discoveryRepository.findRecommendations(userId, limit, offset);
    return recommendations;
};

const recordInteraction = async (userId, targetUserId, action) => {
    if (!['like', 'dislike'].includes(action)) {
        throw new Error("Invalid action. Must be 'like' or 'dislike'");
    }

    if (userId === targetUserId) {
        throw new Error("You cannot swipe on yourself");
    }

    const interaction = await discoveryRepository.saveInteraction(userId, targetUserId, action);

    // Business Logic: If it's a 'like', we trigger the match engine to see if it's mutual
    if (action === 'like') {
        const potentialMatch = await matchService.checkAndCreateMatch(userId, targetUserId);
        if (potentialMatch) {
            // We append a flag so the controller knows to throw confetti on the frontend
            interaction.isMatch = true;
        }
    }

    return interaction;
};

module.exports = {
    getFeed,
    recordInteraction
};
