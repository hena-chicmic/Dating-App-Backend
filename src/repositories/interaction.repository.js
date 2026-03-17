const db = require('../config/db');

class InteractionRepository {
    /**
     * Records a swipe (like or dislike).
     */
    async saveInteraction(userId, targetUserId, action) {
        const query = `
            INSERT INTO interactions (user_id, target_user_id, action)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, target_user_id) 
            DO UPDATE SET action = EXCLUDED.action, created_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await db.query(query, [userId, targetUserId, action]);
        return result.rows[0];
    }

    /**
     * Get profiles that the user has liked
     */
    async getSentLikes(userId) {
        const query = `
            SELECT 
                u.id, 
                u.username, 
                EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) as age,
                p.profile_photo_url,
                p.location_city,
                i.created_at as liked_on
            FROM interactions i
            JOIN users u ON i.target_user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE i.user_id = $1 AND i.action = 'like'
            ORDER BY i.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    /**
     * Get profiles that have liked the user
     */
    async getReceivedLikes(userId) {
        const query = `
            SELECT 
                u.id, 
                u.username, 
                EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) as age,
                p.profile_photo_url,
                p.location_city,
                i.created_at as liked_on
            FROM interactions i
            JOIN users u ON i.user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE i.target_user_id = $1 AND i.action = 'like'
            ORDER BY i.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = new InteractionRepository();
