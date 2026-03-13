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

        await client.query(
            `UPDATE interests 
            SET name=$1
            WHERE id=$2`,
            [profileData,userId]
        )

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

const uploadMedia=async()






module.exports = {
    getMyProfile,
    updateMyProfile,
    getMyMedia,


};