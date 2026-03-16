const db = require('../config/db')


const getNotifications = async (userId) => {
    const query = `
        SELECT id, type, reference_id, message, is_read
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
    `
    const result = await db.query(query, [userId])
    return result.rows
}

const markRead = async (userId, notification_id) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1
        AND id = $2
        RETURNING *
    `
    const result = await db.query(query, [userId, notification_id])
    return result.rows[0]
}

const markAllRead = async (userId) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1
        RETURNING *
    `
    const result = await db.query(query, [userId])
    return result.rows
}

const createNotifications = async (userId, type, reference_id, message) => {
    const query = `
        INSERT INTO notifications(user_id, type, reference_id, message)
        VALUES($1,$2,$3,$4)
        RETURNING *
    `
    const result = await db.query(query,[userId,type,reference_id,message])
    return result.rows[0]
}

module.exports = {
    getNotifications,
    markRead,
    markAllRead,
    createNotifications
}