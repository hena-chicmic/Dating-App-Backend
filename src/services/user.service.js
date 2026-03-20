const userRepository = require('../repositories/user.repository');
const cache = require('../utils/cache');
const cloudinary = require('../config/cloudinary');

const TTL = {
    PROFILE: 5 * 60,
    PUBLIC_PROFILE: 10 * 60,
    INTERESTS_ALL: 60 * 60,
    MY_INTERESTS: 5 * 60
};

const getMyProfile = async (userId) => {
    const key = `user:${userId}:profile`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const profile = await userRepository.getMyProfile(userId);
    await cache.set(key, profile, TTL.PROFILE);
    return profile;
};

const updateMyProfile = async (userId, profileData) => {
    const result = await userRepository.updateMyProfile(userId, profileData);
    await cache.del(`user:${userId}:profile`);
    await cache.del(`user:${userId}:public`);
    return result;
};

const getMyMedia = async (userId) => {
    return await userRepository.getMyMedia(userId);
};

const uploadMedia = async (userId, mediaData) => {
    const result = await userRepository.uploadMedia(userId, mediaData);
    await cache.del(`user:${userId}:profile`);
    await cache.del(`user:${userId}:public`);
    return result;
};

const deleteMedia = async (userId, mediaId) => {
    const media = await userRepository.deleteMedia(userId, mediaId);
    
    if (media && media.media_url) {
        try {
            const urlParts = media.media_url.split('/');
            const fileName = urlParts[urlParts.length - 1]; 
            const publicId = fileName.split('.')[0]; 
            
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Failed to delete media from Cloudinary:', err.message);
        }
    }
    
    await cache.del(`user:${userId}:profile`);
    await cache.del(`user:${userId}:public`);
    return { success: true };
};

const setPrimaryMedia = async (userId, mediaId) => {
    const result = await userRepository.setPrimaryMedia(userId, mediaId);
    await cache.del(`user:${userId}:profile`);
    await cache.del(`user:${userId}:public`);
    return result;
};

const getAllInterests = async () => {
    const key = `interests:all`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const interests = await userRepository.getAllInterests();
    await cache.set(key, interests, TTL.INTERESTS_ALL);
    return interests;
};

const getMyInterests = async (userId) => {
    const key = `user:${userId}:interests`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const interests = await userRepository.getMyInterests(userId);
    await cache.set(key, interests, TTL.MY_INTERESTS);
    return interests;
};

const updateMyInterests = async (userId, interestsIds) => {
    const result = await userRepository.updateMyInterests(userId, interestsIds);
    await cache.del(`user:${userId}:interests`);
    return result;
};

const getUserProfile = async (requestingUserId, targetUserId) => {
    const key = `user:${targetUserId}:public`;
    const cached = await cache.get(key);
    if (cached) return cached;

    const profile = await userRepository.getUserProfile(requestingUserId, targetUserId);
    await cache.set(key, profile, TTL.PUBLIC_PROFILE);
    return profile;
};

const deactivateAccount = async (userId) => {
    await cache.del(`user:${userId}:profile`);
    await cache.del(`user:${userId}:public`);
    return await userRepository.deactivateAccount(userId);
};

const deleteAccount = async (userId) => {
    await cache.del(`user:${userId}:profile`);
    await cache.del(`user:${userId}:public`);
    await cache.del(`user:${userId}:interests`);
    return await userRepository.deleteAccount(userId);
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
