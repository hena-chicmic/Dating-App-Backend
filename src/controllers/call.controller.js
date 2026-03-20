const callService = require('../services/call.service');

const getCallHistory = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const history = await callService.getHistory(matchId, parseInt(page), parseInt(limit));

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCallHistory
};
