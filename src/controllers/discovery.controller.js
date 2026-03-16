const discoveryService = require('../services/discovery.service');

const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.user_id; // Added by isAuthenticated middleware
        const page = parseInt(req.query.page) || 1;
        
        const feed = await discoveryService.getFeed(userId, page);
        
        res.status(200).json({
            message: "Feed retrieved successfully",
            data: feed
        });
    } catch (error) {
        next(error);
    }
};

const swipe = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { targetUserId, action } = req.body;

        if (!targetUserId || !action) {
            return res.status(400).json({ message: "targetUserId and action are required" });
        }

        await discoveryService.recordInteraction(userId, targetUserId, action);

        res.status(200).json({
            message: `Successfully swiped ${action} on user ${targetUserId}`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecommendations,
    swipe
};
