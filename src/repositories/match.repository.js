const db = require('../config/db');

class MatchRepository {

    async checkMutualLike(userA, userB) {
        const query = `
            SELECT 1 FROM interactions
            WHERE user_id = $1 AND target_user_id = $2 AND action = 'like'
        `;
        const result = await db.query(query, [userB, userA]);
        return result.rows.length > 0;
    }

    async createMatch(userA, userB) {

        const user1 = Math.min(userA, userB);
        const user2 = Math.max(userA, userB);

        const query = `
            INSERT INTO matches (user1_id, user2_id)
            VALUES ($1, $2)
            ON CONFLICT (user1_id, user2_id) DO NOTHING
            RETURNING *;
        `;
        const result = await db.query(query, [user1, user2]);
        return result.rows[0];
    }

    async fetchUserMatches(userId) {
        const query = `
            SELECT
                m.id as match_id,
                m.created_at as matched_on,
                u.id as user_id,
                u.username,
                p.profile_photo_url,
                p.location_city
            FROM matches m
            JOIN users u ON (u.id = m.user1_id OR u.id = m.user2_id) AND u.id != $1
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE (m.user1_id = $1 OR m.user2_id = $1)
            AND m.is_active = TRUE
            ORDER BY m.created_at DESC;
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = new MatchRepository();
