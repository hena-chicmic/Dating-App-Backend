const messageRepository = require('../repositories/message.repository');
const matchRepository = require('../repositories/match.repository');


const sendMessage = async (matchId, senderId, text, mediaUrl = null, mediaType = null) => {
   
    const matches = await matchRepository.fetchUserMatches(senderId);
    const isInMatch = matches.some(m => m.match_id === parseInt(matchId));
    if (!isInMatch) {
        throw new Error('You are not a participant in this match.');
    }

    const message = await messageRepository.saveMessage(matchId, senderId, text, mediaUrl, mediaType);
    return message;
};


const getChatHistory = async (matchId, page = 1, limit = 50) => {
    const offset = (page - 1) * limit;
    const messages = await messageRepository.getMessagesByMatch(matchId, limit, offset);
    return messages;
};


const markRead = async (matchId, receiverId) => {
    const updated = await messageRepository.markMessagesAsRead(matchId, receiverId);
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
