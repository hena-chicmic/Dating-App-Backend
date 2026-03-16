const messageService = require('../services/message.service');

const getChatHistory = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const messages = await messageService.getChatHistory(matchId, page, limit);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

const markRead = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const receiverId = req.user.id;

        await messageService.markRead(matchId, receiverId);
        res.status(200).json({ success: true, message: 'Messages marked as read.' });
    } catch (error) {
        next(error);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user.id;

        const deleted = await messageService.deleteMessage(messageId, senderId);
        res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        next(error);
    }
};

module.exports = { getChatHistory, markRead, deleteMessage };
