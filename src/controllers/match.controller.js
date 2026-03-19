const matchService = require('../services/match.service');

const getUserMatches = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const matches = await matchService.getMatches(userId);

        res.status(200).json({
            message: "Matches retrieved successfully",
            data: matches
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserMatches
};
