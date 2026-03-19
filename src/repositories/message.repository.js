const db = require('../config/db');

const saveMessage =async(matchId, senderId, messageText, mediaUrl = null, mediaType = null) => {
    const query = `
        INSERT INTO messages (match_id, sender_id, message_text, media_url, media_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const result = await db.query(query, [matchId, senderId, messageText, mediaUrl, mediaType]);
    return result.rows[0];
};

const getMessagesByMatch = async (matchId, limit = 50, offset = 0) => {
    const query = `
        SELECT
            m.id,
            m.match_id,
            m.sender_id,
            m.message_text,
            m.media_url,
            m.media_type,
            m.is_read,
            m.created_at,
            u.username AS sender_username
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.match_id = $1
          AND m.is_deleted = FALSE
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3;
    `;
    const result = await db.query(query, [matchId, limit, offset]);
    return result.rows;
};

const markMessagesAsRead = async (matchId, receiverId) => {
    const query = `
        UPDATE messages
        SET is_read = TRUE
        WHERE match_id = $1
          AND sender_id != $2
          AND is_read = FALSE
        RETURNING id;
    `;
    const result = await db.query(query, [matchId, receiverId]);
    return result.rows;
};

const softDeleteMessage = async (messageId, senderId) => {
    const query = `
        UPDATE messages
        SET is_deleted = TRUE
        WHERE id = $1 AND sender_id = $2
        RETURNING id;
    `;
    const result = await db.query(query, [messageId, senderId]);
    return result.rows[0];
};

module.exports = {
    saveMessage,
    getMessagesByMatch,
    markMessagesAsRead,
    softDeleteMessage,
};
