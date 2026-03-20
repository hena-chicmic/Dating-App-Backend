const messageRepository = require('../repositories/message.repository');
const matchRepository = require('../repositories/match.repository');
const { addNotificationJob } = require('../queues/notification.queue');

const sendMessage = async (matchId, senderId, text, mediaUrl = null, mediaType = null) => {

    const matches = await matchRepository.fetchUserMatches(senderId);
    const targetMatch = matches.find(m => m.match_id === parseInt(matchId));
    if (!targetMatch) {
        throw new Error('You are not a participant in this match.');
    }

    const message = await messageRepository.saveMessage(matchId, senderId, text, mediaUrl, mediaType);

    const receiverId = (targetMatch.user1_id === parseInt(senderId)) ? targetMatch.user2_id : targetMatch.user1_id;

    if (receiverId) {
        try {

            await addNotificationJob(
                receiverId,
                'new_message',
                matchId,
                "You have a new message!"
            );
        } catch (err) {
            console.error('Failed to create new_message notification:', err.message);
        }
    }

    return message;
};

const getChatHistory = async (matchId, userId, page = 1, limit = 50) => {
    // Verify participation
    const authorized = await matchRepository.isUserInMatch(userId, matchId);
    if (!authorized) {
        throw new Error('Unauthorized access to this chat history.');
    }

    const offset = (page - 1) * limit;
    const messages = await messageRepository.getMessagesByMatch(matchId, limit, offset);
    return messages;
};

const markRead = async (matchId, userId) => {
    // Verify participation
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
