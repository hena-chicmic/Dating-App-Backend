const db = require('../config/db');
const { DISCOVERY } = require('../utils/constants');

class DiscoveryRepository {
    async findRecommendations(userId, limit = DISCOVERY.DEFAULT_PAGE_SIZE, offset = 0) {

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

        // Use null instead of 0 for coordinates to indicate missing location
        const searchLat = prefs.latitude ?? null;
        const searchLong = prefs.longitude ?? null;

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
                CASE 
                    WHEN $7::double precision IS NOT NULL AND $8::double precision IS NOT NULL 
                    THEN (ST_Distance(p.location_geog, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography) / 1000.0) 
                    ELSE NULL 
                END AS distance_km
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN user_interests ui1 ON u.id = ui1.user_id
            LEFT JOIN user_interests ui2 ON ui1.interest_id = ui2.interest_id AND ui2.user_id = $1
            WHERE u.id != $1
            AND u.is_active=true
            AND u.is_banned=false
            AND ($2 = 'both' OR u.gender = $2)

            AND EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN ($3 - ${DISCOVERY.AGE_FUDGE_FACTOR}) AND ($4 + ${DISCOVERY.AGE_FUDGE_FACTOR})
            AND p.location_geog IS NOT NULL

            -- Only filter by distance if user coordinates are available
            AND (
                ($7::double precision IS NULL OR $8::double precision IS NULL)
                OR ST_DWithin(p.location_geog, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography, $9 * 1000)
            )

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
                -- Priority 0 for nearby if coords exist, otherwise everyone is Priority 0
                CASE 
                    WHEN $7::double precision IS NOT NULL AND $8::double precision IS NOT NULL 
                    THEN (CASE WHEN (ST_Distance(p.location_geog, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography) / 1000.0) <= ${DISCOVERY.NEARBY_RADIUS_KM} THEN 0 ELSE 1 END)
                    ELSE 0 
                END ASC,

                CASE WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN $3 AND $4 THEN 0 ELSE 1 END ASC,

                common_interests DESC,
                distance_km ASC NULLS LAST,
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
            searchLat,
            searchLong,
            DISCOVERY.MAX_DISTANCE_KM
        ];

        const result = await db.query(query, values);
        return result.rows;
    }
}

module.exports = new DiscoveryRepository();
