const db = require('../config/db');

class DiscoveryRepository {
    async findRecommendations(userId, limit = 10, offset = 0) {
        // 1. Fetch the logged-in user's preferences AND their own GPS location
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

        // Default to a 15km radius if the user has no preferred distance (yet)
        const maxDistanceKm = 15;

        // 2. The Recommendation SQL
        // This query joins users and user_profiles.
        // It filters out anyone the user has already swiped on (exists in interactions).
        // It enforces gender and age boundaries.
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
                -- Haversine formula to calculate distance in Kilometers
                (6371 * acos(
                    cos(radians($7)) * cos(radians(p.latitude)) * 
                    cos(radians(p.longitude) - radians($8)) + 
                    sin(radians($7)) * sin(radians(p.latitude))
                )) AS distance_km
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            -- Join the target user's interests
            LEFT JOIN user_interests ui1 ON u.id = ui1.user_id 
            -- Join the logged-in user's interests ONLY if they match the target's
            LEFT JOIN user_interests ui2 ON ui1.interest_id = ui2.interest_id AND ui2.user_id = $1
            WHERE u.id != $1
            AND u.gender = $2
            -- Relaxed Age: Up to 5 years outside their preference
            AND EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN ($3 - 5) AND ($4 + 5)
            AND p.latitude IS NOT NULL 
            AND p.longitude IS NOT NULL
            -- Relaxed Distance: Hard cap at 100km
            AND (6371 * acos(
                    cos(radians($7)) * cos(radians(p.latitude)) * 
                    cos(radians(p.longitude) - radians($8)) + 
                    sin(radians($7)) * sin(radians(p.latitude))
                )) <= 100
            AND NOT EXISTS (
                SELECT 1 FROM interactions i 
                WHERE i.user_id = $1 AND i.target_user_id = u.id
            )
            GROUP BY u.id, p.profile_photo_url, p.location_city, p.location_country, p.latitude, p.longitude
            ORDER BY 
                -- Tier 1: Prioritize users within the preferred distance ($9)
                CASE WHEN (6371 * acos(
                    cos(radians($7)) * cos(radians(p.latitude)) * 
                    cos(radians(p.longitude) - radians($8)) + 
                    sin(radians($7)) * sin(radians(p.latitude))
                )) <= $9 THEN 0 ELSE 1 END ASC,
                -- Tier 2: Prioritize users within the exact preferred age range
                CASE WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN $3 AND $4 THEN 0 ELSE 1 END ASC,
                -- Normal sorting
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
