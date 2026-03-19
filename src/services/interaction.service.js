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

    if (action === 'like') {

        await addMatchJob(userId, targetUserId);

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

    await discoveryService.invalidateFeed(userId);

    return interaction;
};

const getSentLikes = async (userId) => {
    return await interactionRepository.getSentLikes(userId);
};

const getReceivedLikes = async (userId) => {
    return await interactionRepository.getReceivedLikes(userId);
};

const unblockUser = async (userId, targetUserId) => {
    const success = await interactionRepository.unblockUser(userId, targetUserId);
    if (!success) {
        throw new Error("Block record not found.");
    }
    return success;
};

const blockUser = async (userId, targetUserId) => {
    if (userId === parseInt(targetUserId)) {
        throw new Error("You cannot block yourself.");
    }
    return await interactionRepository.blockUser(userId, targetUserId);
};

module.exports = {
    recordInteraction,
    getSentLikes,
    getReceivedLikes,
    unblockUser,
    blockUser
};
