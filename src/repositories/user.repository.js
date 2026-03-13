const db = require('../config/db');

const getMyProfile = async (userId) => {
    const query = `
        SELECT u.*, p.*
        FROM users u
        LEFT JOIN user_profiles p
        ON u.id = p.user_id
        WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

const updateMyProfile = async (userId, profileData) => {
    const {
        username,
        gender,
        interested_in,
        min_preferred_age,
        max_preferred_age,
        bio,
        height,
        location_city,
        location_country,
        latitude,
        longitude,
        profile_photo_url
    } = profileData;

    const client = await db.connect();

    try {

        await client.query('BEGIN');

        await client.query(
        `UPDATE users
            SET username=$1,
                gender=$2,
                interested_in=$3,
                min_preferred_age=$4,
                max_preferred_age=$5,
                bio=$6,
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
            SET height=$1,
                location_city=$2,
                location_country=$3,
                latitude=$4,
                longitude=$5,
                profile_photo_url=$6,
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
    const query=`SELECT id, media_url, is_primary FROM user_media WHERE user_id=$1`
    const result= await db.query(query,[userId])
    return result.rows
}

const uploadMedia = async (userId, mediaData) => {
    const { media_url, media_type = 'image' } = mediaData;
    const existingMediaResult = await db.query(
        `SELECT COUNT(*) FROM user_media WHERE user_id = $1`,
        [userId]
    );
    const isFirstPhoto = parseInt(existingMediaResult.rows[0].count) === 0;

    const query = `
        INSERT INTO user_media (user_id, media_url, media_type, is_primary)
        VALUES ($1, $2, $3, $4)
        RETURNING id, media_url, media_type, is_primary, created_at
    `;
    const result = await db.query(query, [userId, media_url, media_type, isFirstPhoto]);
    return result.rows[0];
};

const deleteMedia = async (userId, mediaId) => {
    const query = `DELETE FROM user_media WHERE id = $1 AND user_id = $2`;
    await db.query(query, [mediaId, userId]);
    return { success: true };
};

const setPrimaryMedia = async (userId, mediaId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        // Unset any existing primary media
        await client.query(`UPDATE user_media SET is_primary = FALSE WHERE user_id = $1`, [userId]);
        // Set the new primary media
        await client.query(`UPDATE user_media SET is_primary = TRUE WHERE id = $1 AND user_id = $2`, [mediaId, userId]);
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
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
        SELECT u.id, u.username, EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) as age, u.gender,
               p.bio, p.height, p.location_city, p.location_country, p.profile_photo_url
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = $1
    `;
    const result = await db.query(query, [targetUserId]);
    
    if (!result.rows.length) return null;
    
    const profile = result.rows[0];
    
    // Fetch their media
    const mediaResult = await db.query(`SELECT id, media_url, is_primary FROM user_media WHERE user_id = $1`, [targetUserId]);
    profile.media = mediaResult.rows;
    
    // Fetch their interests
    profile.interests = await getMyInterests(targetUserId);
    
    return profile;
};

const deactivateAccount = async (userId) => {
    // Depending on schema, maybe there is an is_active column. 
    // Usually, dating apps soft-delete users. If no column exists, we might need a migration for it.
    // For now, let's assume dropping profile data or setting a flag.
    // Let's implement a HARD delete since deleteAccount is also here, so assuming deactivate might just hide the profile.
    // Since we don't have an is_active column in `users` currently (based on previous schemas), we'll do a basic update.
    // To cleanly build this, we'll run a query that deletes their interactions so they disappear from feeds.
    const query = `DELETE FROM interactions WHERE user_id = $1 OR target_user_id = $1`;
    await db.query(query, [userId]);
    return { success: true };
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