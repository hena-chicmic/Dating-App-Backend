const messageRepository = require('../repositories/message.repository');
const matchRepository = require('../repositories/match.repository');
const userRepository = require('../repositories/user.repository');
const { addNotificationJob } = require('../queues/notification.queue');
const logger = require('../utils/logger');

const sendMessage = async (matchId, senderId, text, mediaUrl = null, mediaType = null) => {

    const matches = await matchRepository.fetchUserMatches(senderId);
    const targetMatch = matches.find(m => m.match_id.toString() === matchId.toString());
    if (!targetMatch) {
        throw new Error('You are not a participant in this match.');
    }

    // In fetchUserMatches, user_id belongs to the partner, so it is the receiver ID
    const receiverId = targetMatch.user_id;

    const message = await messageRepository.saveMessage(matchId, senderId, receiverId, text, mediaUrl, mediaType);

    if (receiverId) {
        try {
            const sender = await userRepository.getMyProfile(senderId);
            if (sender) {
                await addNotificationJob(receiverId, 'new_message', matchId, `New message from ${sender.username}`);
            }
        } catch (err) {
            logger.error(`Notification error on send_message: ${err.message}`);
        }
    }

    return message;
};

const getChatHistory = async (matchId, userId, page = 1, limit = 50) => {
    const authorized = await matchRepository.isUserInMatch(userId, matchId);
    if (!authorized) {
        throw new Error('Unauthorized access to this chat history.');
    }

    const offset = (page - 1) * limit;
    const messages = await messageRepository.getMessagesByMatch(matchId, limit, offset);
    return messages;
};

const markRead = async (matchId, userId) => {
    const authorized = await matchRepository.isUserInMatch(userId, matchId);
    if (!authorized) {
        throw new Error('Unauthorized access to this match.');
    }

    const updated = await messageRepository.markMessagesAsRead(matchId, userId);
    return updated;
};

const deleteMessage = async (messageId, senderId) => {
    const deleted = await messageRepository.softDeleteMessage(messageId, senderId);
    if (!deleted) throw new Error('Message not found or not authorized.');
    return deleted;
};

module.exports = {
    sendMessage,
    getChatHistory,
    markRead,
    deleteMessage,
};
