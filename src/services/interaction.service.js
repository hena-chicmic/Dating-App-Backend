const interactionRepository = require('../repositories/interaction.repository');
const { addMatchJob, addNotificationJob } = require('../queues');
const discoveryService = require('./discovery.service');

const recordInteraction = async (userId, targetUserId, action) => {
    if (!['like', 'dislike'].includes(action)) {
        throw new Error("Invalid action. Must be 'like' or 'dislike'");
    }

    if (userId === parseInt(targetUserId)) {
        throw new Error("You cannot swipe on yourself");
    }

    const interaction = await interactionRepository.saveInteraction(userId, targetUserId, action);

    // Business Logic: If it's a 'like', we offload everything to the background.
    if (action === 'like') {
        // 1. Offload the "Mutual Match" check to the MatchWorker
        await addMatchJob(userId, targetUserId);
        
        // 2. Offload the "New Like" notification to the NotificationWorker
        await addNotificationJob(targetUserId, 'new_like', userId, "Someone liked your profile!");
    }

    // Invalidate discovery feed cache
    await discoveryService.invalidateFeed(userId);

    // Concept: UI feedback like confetti should be triggered via Sockets 
    // when the MatchWorker finishes its job and emits a 'new_match' event.
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
