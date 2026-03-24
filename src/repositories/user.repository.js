const mongoose = require('mongoose');
const User = require('../models/user.model');
const Block = require('../models/block.model');
const Interest = require('../models/interest.model');
const Match = require('../models/match.model');
const Interaction = require('../models/interaction.model');
const logger = require('../utils/logger');

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

    const parts = mediaUrl.split('/');
    const lastPart = parts[parts.length - 1]; 
    const publicIdWithFolder = `dating-app/users/${lastPart.split('.')[0]}`; 

    try {
        const cloudinary = require('../config/cloudinary');
        await cloudinary.uploader.destroy(publicIdWithFolder);
    } catch (err) {
        logger.error("Cloudinary media deletion failed remotely, but continuing database sync:", err);
    }

    user.profile.media.pull(mediaId);

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

    user.profile.media.forEach(m => m.is_primary = false);
    
    mediaItem.is_primary = true;
    user.profile.profile_photo_url = mediaItem.media_url;

    await user.save();
    return { success: true };
};

const getAllInterests = async () => {
    return await Interest.find({ is_active: true })
        .select('name category -_id')
        .sort({ category: 1, name: 1 })
        .lean();
};

const getMyInterests = async (userId) => {
    const user = await User.findById(userId, 'interests');
    return user?.interests || [];
};

const updateMyInterests = async (userId, interestNames) => {
    const validInterestsCount = await Interest.countDocuments({
        name: { $in: interestNames },
        is_active: true
    });
    if (validInterestsCount !== interestNames.length) {
        throw new Error("One or more of the selected interests are invalid or unapproved by moderation.");
    }

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await User.findByIdAndUpdate(userId, { is_active: false }, { session });
        
        await Match.updateMany(
            { $or: [{ user1_id: userId }, { user2_id: userId }] },
            { status: 'deactivated' },
            { session }
        );

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const deleteAccount = async (userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await User.findByIdAndDelete(userId, { session });
        
        await Interaction.deleteMany(
            { $or: [{ user_id: userId }, { target_user_id: userId }] },
            { session }
        );

        await Match.deleteMany(
            { $or: [{ user1_id: userId }, { user2_id: userId }] },
            { session }
        );

        await Block.deleteMany(
            { $or: [{ blocker_id: userId }, { blocked_id: userId }] },
            { session }
        );

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
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
