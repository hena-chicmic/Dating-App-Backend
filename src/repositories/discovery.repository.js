const db = require('../config/db');

class DiscoveryRepository {
    async findRecommendations(userId, limit = 10, offset = 0) {

        const userPrefsResult = await db.query(
            `SELECT u.interested_in, u.min_preferred_age, u.max_preferred_age, p.latitude, p.longitude
             FROM users u
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (!userPrefsResult.rows.length) {
            throw new Error("User preferences not found");
        }
        const prefs = userPrefsResult.rows[0];

        const maxDistanceKm = 15;

        const query = `
            SELECT
                u.id,
                u.username,
                EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) as age,
                u.bio,
                p.profile_photo_url,
                p.location_city,
                p.location_country,
                COUNT(ui2.interest_id) AS common_interests,

                (ST_Distance(p.location_geog, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography) / 1000.0) AS distance_km
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id

            LEFT JOIN user_interests ui1 ON u.id = ui1.user_id

            LEFT JOIN user_interests ui2 ON ui1.interest_id = ui2.interest_id AND ui2.user_id = $1
            WHERE u.id != $1
            AND u.is_active=true
            AND u.is_banned=false
            AND u.gender = $2

            AND EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN ($3 - 5) AND ($4 + 5)
            AND p.location_geog IS NOT NULL

            AND ST_DWithin(p.location_geog, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography, 2000 * 1000)
            AND NOT EXISTS (
                SELECT 1 FROM interactions i
                WHERE i.user_id = $1 AND i.target_user_id = u.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM blocks b
                WHERE (b.blocker_id = $1 AND b.blocked_id = u.id)
                   OR (b.blocker_id = u.id AND b.blocked_id = $1)
            )
            GROUP BY u.id, p.profile_photo_url, p.location_city, p.location_country, p.location_geog
            ORDER BY

                CASE WHEN (ST_Distance(p.location_geog, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography) / 1000.0) <= $9 THEN 0 ELSE 1 END ASC,

                CASE WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN $3 AND $4 THEN 0 ELSE 1 END ASC,

                common_interests DESC,
                distance_km ASC,
                u.created_at DESC
            LIMIT $5 OFFSET $6
        `;

        const values = [
            userId,
            prefs.interested_in,
            prefs.min_preferred_age,
            prefs.max_preferred_age,
            limit,
            offset,
            prefs.latitude || 0,
            prefs.longitude || 0,
            maxDistanceKm
        ];

        const result = await db.query(query, values);
        return result.rows;
    }
}

module.exports = new DiscoveryRepository();
