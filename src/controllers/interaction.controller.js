const interactionService = require('../services/interaction.service');

const swipe = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { targetUserId, action } = req.body;

        if (!targetUserId || !action) {
            return res.status(400).json({ message: "targetUserId and action are required" });
        }

        const interaction = await interactionService.recordInteraction(userId, targetUserId, action);

        res.status(200).json({
            message: `Successfully swiped ${action} on user ${targetUserId}`,
            data: interaction
        });
    } catch (error) {
        next(error);
    }
};

const getSentLikes = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const likes = await interactionService.getSentLikes(userId);

        res.status(200).json({
            message: "Sent likes retrieved successfully",
            data: likes
        });
    } catch (error) {
        next(error);
    }
};

const getReceivedLikes = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const likes = await interactionService.getReceivedLikes(userId);

        res.status(200).json({
            message: "Received likes retrieved successfully",
            data: likes
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    swipe,
    getSentLikes,
    getReceivedLikes
};
