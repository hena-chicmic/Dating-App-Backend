const db = require('../config/db');

class InteractionRepository {

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

    async blockUser(blockerId, blockedId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const blockQuery = `
                INSERT INTO blocks (blocker_id, blocked_id)
                VALUES ($1, $2)
                ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
            `;
            await client.query(blockQuery, [blockerId, blockedId]);

            const matchQuery = `
                UPDATE matches
                SET is_active = FALSE
                WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);
            `;
            await client.query(matchQuery, [blockerId, blockedId]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async unblockUser(blockerId, blockedId) {
        const query = `
            DELETE FROM blocks
            WHERE blocker_id = $1 AND blocked_id = $2
            RETURNING id;
        `;
        const result = await db.query(query, [blockerId, blockedId]);
        return result.rowCount > 0;
    }
}

module.exports = new InteractionRepository();
