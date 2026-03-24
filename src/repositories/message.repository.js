const Message = require('../models/message.model');

const saveMessage = async (matchId, senderId, receiverId, messageText, mediaUrl = null, mediaType = null) => {
    const newMessage = new Message({
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        content_text: messageText,
        media_url: mediaUrl,
        content_type: mediaType || 'text'
    });
    return await newMessage.save();
};

const getMessagesByMatch = async (matchId, limit = 50, offset = 0) => {
    const messages = await Message.find({
        match_id: matchId,
        is_deleted: false
    })
    .populate({
        path: 'sender_id',
        match: { is_banned: false },
        select: 'username'
    })
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

    // Filter out messages where sender is banned (populate returns null)
    return messages.filter(m => m.sender_id).map(m => ({
        id: m._id,
        match_id: m.match_id,
        sender_id: m.sender_id._id,
        message_text: m.content_text,
        media_url: m.media_url,
        media_type: m.content_type,
        is_read: m.is_read,
        created_at: m.created_at,
        sender_username: m.sender_id.username
    }));
};

const markMessagesAsRead = async (matchId, receiverId) => {
    const result = await Message.updateMany(
        { 
            match_id: matchId, 
            sender_id: { $ne: receiverId },
            is_read: false 
        },
        { $set: { is_read: true } }
    );
    return result.modifiedCount > 0;
};

const softDeleteMessage = async (messageId, senderId) => {
    return await Message.findOneAndUpdate(
        { _id: messageId, sender_id: senderId },
        { $set: { is_deleted: true } },
        { new: true }
    );
};

module.exports = {
    saveMessage,
    getMessagesByMatch,
    markMessagesAsRead,
    softDeleteMessage,
};
