const interactionRepository = require('../repositories/interaction.repository');
const matchService = require('./match.service');
const discoveryService = require('./discovery.service'); 

const recordInteraction = async (userId, targetUserId, action) => {
    if (!['like', 'dislike'].includes(action)) {
        throw new Error("Invalid action. Must be 'like' or 'dislike'");
    }

    if (userId === targetUserId) {
        throw new Error("You cannot swipe on yourself");
    }

    const interaction = await interactionRepository.saveInteraction(userId, targetUserId, action);

    // Business Logic: If it's a 'like', we trigger the match engine to see if it's mutual
    if (action === 'like') {
        const potentialMatch = await matchService.checkAndCreateMatch(userId, targetUserId);
        if (potentialMatch) {
            // We append a flag so the controller knows to throw confetti on the frontend
            interaction.isMatch = true;
        } else {
            // Not a mutual match yet, just a regular like, so notify the target user
            try {
                // We must require notificationService locally or at top level. Let's do top level soon.
                // Wait, it's not imported. Let me just use the imported one. I'll add the import too
                const notificationService = require('./notification.service');
                await notificationService.createNotifications(
                    targetUserId, 
                    'new_like', 
                    userId, 
                    "Someone liked your profile!"
                );
            } catch (err) {
                console.error('Failed to create new_like notification:', err.message);
            }
        }
    }

    // Invalidate discovery feed cache so user sees fresh recommendations
    await discoveryService.invalidateFeed(userId);

    return interaction;
};

const getSentLikes = async (userId) => {
    return await interactionRepository.getSentLikes(userId);
};

const getReceivedLikes = async (userId) => {
    return await interactionRepository.getReceivedLikes(userId);
};

module.exports = {
    recordInteraction,
    getSentLikes,
    getReceivedLikes
};
