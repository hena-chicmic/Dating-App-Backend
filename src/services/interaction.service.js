const interactionRepository = require('../repositories/interaction.repository');
const discoveryService = require('./discovery.service'); 
const { addMatchJob, addNotificationJob } = require('../queues');

const recordInteraction = async (userId, targetUserId, action) => {
    if (!['like', 'dislike'].includes(action)) {
        throw new Error("Invalid action. Must be 'like' or 'dislike'");
    }

    if (userId === targetUserId) {
        throw new Error("You cannot swipe on yourself");
    }

    const interaction = await interactionRepository.saveInteraction(userId, targetUserId, action);

    // Business Logic: If it's a 'like', dispatch jobs to the background queues
    if (action === 'like') {
        // 1. Dispatch Match check to background worker
        await addMatchJob(userId, targetUserId);

        // 2. Dispatch a standard notification for the Like
        try {
            await addNotificationJob(
                targetUserId, 
                'new_like', 
                userId, 
                "Someone liked your profile!"
            );
        } catch (err) {
            console.error('Failed to dispatch new_like notification job:', err.message);
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
