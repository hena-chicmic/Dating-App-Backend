const User = require('../models/user.model');
const Block = require('../models/block.model');

const getMyProfile = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    // Map Mongoose structure back to what controller expects
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        interested_in: user.interested_in,
        min_preferred_age: user.preferences?.min_preferred_age,
        max_preferred_age: user.preferences?.max_preferred_age,
        bio: user.bio,
        is_active: user.is_active,
        is_verified: user.is_verified,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        height: user.profile?.height,
        location_city: user.profile?.location_city,
        location_country: user.profile?.location_country,
        latitude: user.profile?.location?.coordinates[1],
        longitude: user.profile?.location?.coordinates[0],
        profile_photo_url: user.profile?.profile_photo_url
    };
};

const updateMyProfile = async (userId, profileData) => {
    const update = {};
    
    // Top level fields
    if (profileData.username) update.username = profileData.username;
    if (profileData.gender) update.gender = profileData.gender;
    if (profileData.interested_in) update.interested_in = profileData.interested_in;
    if (profileData.bio !== undefined) update.bio = profileData.bio;
    if (profileData.date_of_birth) update.date_of_birth = profileData.date_of_birth;

    // Preferences
    if (profileData.min_preferred_age) update['preferences.min_preferred_age'] = profileData.min_preferred_age;
    if (profileData.max_preferred_age) update['preferences.max_preferred_age'] = profileData.max_preferred_age;

    // Profile sub-document
    if (profileData.height) update['profile.height'] = profileData.height;
    if (profileData.location_city) update['profile.location_city'] = profileData.location_city;
    if (profileData.location_country) update['profile.location_country'] = profileData.location_country;
    if (profileData.profile_photo_url) update['profile.profile_photo_url'] = profileData.profile_photo_url;

    // GeoSpatial
    if (profileData.longitude !== undefined && profileData.latitude !== undefined) {
        update['profile.location'] = {
            type: 'Point',
            coordinates: [profileData.longitude, profileData.latitude]
        };
    }

    await User.findByIdAndUpdate(userId, { $set: update },{new:true});
    return { success: true };
};

const getMyMedia = async (userId) => {
    const user = await User.findById(userId, 'profile.media');
    return user?.profile?.media || [];
};

const uploadMedia = async (userId, mediaData) => {
    const { media_url, media_type = 'image' } = mediaData;
    
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isFirstPhoto = !user.profile.media || user.profile.media.length === 0;

    const newMedia = {
        media_url,
        media_type,
        is_primary: isFirstPhoto,
        created_at: new Date()
    };

    user.profile.media.push(newMedia);
    
    if (isFirstPhoto) {
        user.profile.profile_photo_url = media_url;
    }

    await user.save();
    
    // Return the last added media item (which now has an _id)
    return user.profile.media[user.profile.media.length - 1];
};

const deleteMedia = async (userId, mediaId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const mediaItem = user.profile.media.id(mediaId);
    if (!mediaItem) {
        throw new Error("Media not found or does not belong to user");
    }

    const wasPrimary = mediaItem.is_primary;
    const mediaUrl = mediaItem.media_url;

    // Cloudinary deletion logic
    const parts = mediaUrl.split('/');
    const lastPart = parts[parts.length - 1]; 
    const publicIdWithFolder = `dating-app/users/${lastPart.split('.')[0]}`; 

    try {
        const cloudinary = require('../config/cloudinary');
        await cloudinary.uploader.destroy(publicIdWithFolder);
    } catch (err) {
        // Log error but continue with DB deletion
    }

    // Remove from array
    user.profile.media.pull(mediaId);

    // If was primary, set new primary
    if (wasPrimary && user.profile.media.length > 0) {
        user.profile.media[0].is_primary = true;
        user.profile.profile_photo_url = user.profile.media[0].media_url;
    } else if (wasPrimary) {
        user.profile.profile_photo_url = null;
    }

    await user.save();
    return { success: true };
};

const setPrimaryMedia = async (userId, mediaId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const mediaItem = user.profile.media.id(mediaId);
    if (!mediaItem) throw new Error("Media not found");

    // Reset all to false
    user.profile.media.forEach(m => m.is_primary = false);
    
    // Set target to true
    mediaItem.is_primary = true;
    user.profile.profile_photo_url = mediaItem.media_url;

    await user.save();
    return { success: true };
};

const getAllInterests = async () => {
    // In Mongo, we might want a separate Interests collection if the list is dynamic
    // For now, if we assume they are strings in the User model, we might just return a static list 
    // or fetch unique interests from all users. 
    // BUT the old code had an `interests` table. 
    // To keep it simple and consistent with "Interests (Array of Strings)", 
    // we'll return a sample or assume a helper provides them.
    return [
        { id: 1, name: 'Music' },
        { id: 2, name: 'Travel' }
        // ... this would ideally come from a specific 'Interest' model if required
    ];
};

const getMyInterests = async (userId) => {
    const user = await User.findById(userId, 'interests');
    return user?.interests || [];
};

const updateMyInterests = async (userId, interestNames) => {
    // Note: The service might send IDs or Names. 
    // The plan said "Array of Strings instead of joining tables".
    await User.findByIdAndUpdate(userId, { interests: interestNames });
    return interestNames;
};

const getUserProfile = async (requestingUserId, targetUserId) => {
    const user = await User.findOne({ 
        _id: targetUserId, 
        is_banned: false 
    }).lean();

    if (!user) return null;

    // Check for blocks
    const blocked = await Block.findOne({
        $or: [
            { blocker_id: requestingUserId, blocked_id: targetUserId },
            { blocker_id: targetUserId, blocked_id: requestingUserId }
        ]
    });

    if (blocked) return null;

    // Calculate age
    const dob = user.date_of_birth;
    const age = dob ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;

    return {
        id: user._id,
        username: user.username,
        age: age,
        gender: user.gender,
        bio: user.bio,
        height: user.profile?.height,
        location_city: user.profile?.location_city,
        location_country: user.profile?.location_country,
        profile_photo_url: user.profile?.profile_photo_url,
        media: user.profile?.media || [],
        interests: user.interests || []
    };
};

const deactivateAccount = async (userId) => {
    // In a real app, we might want to also deactivate matches/interactions here
    // as per the old logic: DELETE FROM interactions WHERE user_id = $1 OR target_user_id = $1
    // Developer 2 will handle Interaction and Match models, so we'll just deactivate the user.
    await User.findByIdAndUpdate(userId, { is_active: false });
    return { success: true };
};

const deleteAccount = async (userId) => {
    await User.findByIdAndDelete(userId);
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
