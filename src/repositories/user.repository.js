const db = require('../config/db');

const getMyProfile = async (userId) => {
    const query = `
        SELECT
            u.id,
            u.username,
            u.email,
            u.date_of_birth,
            u.gender,
            u.interested_in,
            u.min_preferred_age,
            u.max_preferred_age,
            u.bio,
            u.is_active,
            u.is_verified,
            u.created_at,
            u.updated_at,
            p.height,
            p.location_city,
            p.location_country,
            p.latitude,
            p.longitude,
            (
                SELECT media_url
                FROM user_media m
                WHERE m.user_id = u.id AND m.is_primary = true
                LIMIT 1
            ) AS profile_photo_url
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

const updateMyProfile = async (userId, profileData) => {
    const username = profileData.username;
    const gender = profileData.gender;
    const interested_in = profileData.interested_in;
    const min_preferred_age = profileData.min_preferred_age;
    const max_preferred_age = profileData.max_preferred_age;
    const bio = profileData.bio;

    const height = profileData.height;
    const location_city = profileData.location_city;
    const location_country = profileData.location_country;
    const latitude = profileData.latitude;
    const longitude = profileData.longitude;
    const profile_photo_url = profileData.profile_photo_url;

    const client = await db.connect();

    try {

        await client.query('BEGIN');

        await client.query(
        `UPDATE users
            SET username=COALESCE($1, username),
                gender=COALESCE($2, gender),
                interested_in=COALESCE($3, interested_in),
                min_preferred_age=COALESCE($4, min_preferred_age),
                max_preferred_age=COALESCE($5, max_preferred_age),
                bio=COALESCE($6, bio),
                updated_at=NOW()
            WHERE id=$7`,
            [
                username,
                gender,
                interested_in,
                min_preferred_age,
                max_preferred_age,
                bio,
                userId
            ]
        );

        await client.query(
            `UPDATE user_profiles
            SET height=COALESCE($1, height),
                location_city=COALESCE($2, location_city),
                location_country=COALESCE($3, location_country),
                latitude=COALESCE($4, latitude),
                longitude=COALESCE($5, longitude),
                profile_photo_url=COALESCE($6, profile_photo_url),
                updated_at=NOW()
            WHERE user_id=$7`,
            [
                height,
                location_city,
                location_country,
                latitude,
                longitude,
                profile_photo_url,
                userId
            ]
        );

        await client.query('COMMIT');
        return { success: true };

    } catch (error) {

        await client.query('ROLLBACK');
        throw error;

    } finally {

        client.release();

    }
};

const getMyMedia=async(userId)=>{
    const query = `
        SELECT id, media_url, is_primary
        FROM user_media
        WHERE user_id = $1
        ORDER BY is_primary DESC, created_at ASC`;
    const result= await db.query(query,[userId])
    return result.rows
}

const uploadMedia = async (userId, mediaData) => {
    const { media_url, media_type = 'image' } = mediaData;
    const existingMediaResult = await db.query(
        `SELECT EXISTS (
            SELECT 1 FROM user_media WHERE user_id = $1
        )`,
        [userId]
    );

    const isFirstPhoto = !existingMediaResult.rows[0].exists;

    const query = `
        INSERT INTO user_media (user_id, media_url, media_type, is_primary)
        VALUES ($1, $2, $3, $4)
        RETURNING id, media_url, media_type, is_primary, created_at
    `;
    const result = await db.query(query, [userId, media_url, media_type, isFirstPhoto]);
    return result.rows[0];
};

const deleteMedia = async (userId, mediaId) => {
    const query = `
        DELETE FROM user_media
        WHERE id = $1 AND user_id = $2
        RETURNING id
    `;

    const result = await db.query(query, [mediaId, userId]);

    if (result.rowCount === 0) {
        throw new Error("Media not found or does not belong to user");
    }

    return { success: true };
};

const setPrimaryMedia = async (userId, mediaId) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Check media ownership
        const checkMedia = await client.query(
            `SELECT id FROM user_media WHERE id = $1 AND user_id = $2`,
            [mediaId, userId]
        );

        if (checkMedia.rowCount === 0) {
            throw new Error("Media not found or does not belong to user");
        }

        // Remove previous primary
        await client.query(
            `UPDATE user_media SET is_primary = FALSE WHERE user_id = $1`,
            [userId]
        );

        // Set new primary
        await client.query(
            `UPDATE user_media SET is_primary = TRUE WHERE id = $1`,
            [mediaId]
        );

        await client.query("COMMIT");

        return { success: true };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getAllInterests = async () => {
    const query = `SELECT id, name FROM interests ORDER BY name ASC`;
    const result = await db.query(query);
    return result.rows;
};

const getMyInterests = async (userId) => {
    const query = `
        SELECT i.id, i.name 
        FROM interests i
        JOIN user_interests ui ON i.id = ui.interest_id
        WHERE ui.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

const updateMyInterests = async (userId, interestIds) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        await client.query(`DELETE FROM user_interests WHERE user_id = $1`, [userId]);
        
        if (interestIds && interestIds.length > 0) {
            // Build the multi-insert query dynamically: ($1, $2), ($1, $3), etc.
            const values = [];
            const queryBindings = [userId]; // $1
            
            interestIds.forEach((id, index) => {
                queryBindings.push(id);
                // index + 2 because $1 is userId
                values.push(`($1, $${index + 2})`);
            });

            const insertQuery = `
                INSERT INTO user_interests (user_id, interest_id) 
                VALUES ${values.join(', ')}
            `;
            await client.query(insertQuery, queryBindings);
        }
        
        await client.query('COMMIT');
        
        // Return the fresh list of interests
        return await getMyInterests(userId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getUserProfile = async (requestingUserId, targetUserId) => {
    const query = `
        SELECT u.id, 
               u.username, 
               EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) as age, 
               u.gender,
               u.bio,
               p.height, 
               p.location_city, 
               p.location_country, 
               p.profile_photo_url
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = $1
    `;
    const result = await db.query(query, [targetUserId]);
    
    if (!result.rows.length) return null;
    
    const profile = result.rows[0];
    
    // Fetch their media
    const mediaResult = await db.query(
        `SELECT id, media_url, is_primary FROM user_media WHERE user_id = $1`,
        [targetUserId]
    );
    profile.media = mediaResult.rows;
    
    // Fetch their interests
    profile.interests = await getMyInterests(targetUserId);
    
    return profile;
};

const deactivateAccount = async (userId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        await client.query(`UPDATE users SET is_active = FALSE WHERE id = $1`, [userId]);
        await client.query(`DELETE FROM interactions WHERE user_id = $1 OR target_user_id = $1`, [userId]);
        
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteAccount = async (userId) => {
    const query = `DELETE FROM users WHERE id = $1`;
    await db.query(query, [userId]);
    return { success: true };
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getMyMedia,
    uploadMedia,
    deleteMedia,
    setPrimaryMedia,
    getAllInterests,
    getMyInterests,
    updateMyInterests,
    getUserProfile,
    deactivateAccount,
    deleteAccount
};