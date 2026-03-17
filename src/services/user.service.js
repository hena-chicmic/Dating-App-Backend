const userRepository = require('../repositories/user.repository');
const cache = require('../utils/cache');

const TTL = {
    PROFILE: 5 * 60,       // 5 minutes
    PUBLIC_PROFILE: 10 * 60, // 10 minutes
    INTERESTS_ALL: 60 * 60, // 1 hour
    MY_INTERESTS: 5 * 60    // 5 minutes
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
    return result;
};

const getMyMedia = async (userId) => {
    return await userRepository.getMyMedia(userId);
};

const uploadMedia = async (userId, mediaData) => {
    return await userRepository.uploadMedia(userId, mediaData);
};

const deleteMedia = async (userId, mediaId) => {
    return await userRepository.deleteMedia(userId, mediaId);
};

const setPrimaryMedia = async (userId, mediaId) => {
    return await userRepository.setPrimaryMedia(userId, mediaId);
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