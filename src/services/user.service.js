const userRepository = require('../repositories/user.repository');

const getMyProfile = async (userId) => {
    return await userRepository.getMyProfile(userId);
};

const updateMyProfile = async (userId, profileData) => {
    return await userRepository.updateMyProfile(userId, profileData);
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
    return await userRepository.getAllInterests();
};

const getMyInterests = async (userId) => {
    return await userRepository.getMyInterests(userId);
};

const updateMyInterests = async (userId, interestsIds) => {
    return await userRepository.updateMyInterests(userId, interestsIds);
};

const getUserProfile = async (requestingUserId, targetUserId) => {
    return await userRepository.getUserProfile(requestingUserId, targetUserId);
};

const deactivateAccount = async (userId) => {
    return await userRepository.deactivateAccount(userId);
};

const deleteAccount = async (userId) => {
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