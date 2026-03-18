// src/controllers/user.controller.js
const userServices = require('../services/user.service');
const { queueProfileRecalculation } = require('../queues/discovery.queue');

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id; // Assuming authMiddleware attaches user to req
    const profile = await userServices.getMyProfile(userId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const profileData = {
      ...req.body,
      location_city: req.body.location_city || req.body.locationCity,
      location_country: req.body.location_country || req.body.locationCountry
    };

    const updatedProfile = await userServices.updateMyProfile(userId, profileData);

    // Immediately return response, perform heavy match recalculations in background queue
    await queueProfileRecalculation(userId);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};


const getMyMedia = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const media = await userServices.getMyMedia(userId);

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    next(error);
  }
};

const uploadMedia = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const mediaData = {
      media_url: req.file.path,
      media_type: "image"
    };

    const newMedia = await userServices.uploadMedia(userId, mediaData);

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: newMedia
    });

  } catch (error) {
    next(error);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { mediaId } = req.params;

    await userServices.deleteMedia(userId, mediaId);

    res.status(200).json({
      success: true,
      message: "Media deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const setPrimaryMedia = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { mediaId } = req.params;

    await userServices.setPrimaryMedia(userId, mediaId);

    res.status(200).json({
      success: true,
      message: "Primary photo set successfully"
    });
  } catch (error) {
    next(error);
  }
};

const getAllInterests = async (req, res, next) => {
  try {
    const interests = await userServices.getAllInterests();

    res.status(200).json({
      success: true,
      data: interests
    });
  } catch (error) {
    next(error);
  }
};

const getMyInterests = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const interests = await userServices.getMyInterests(userId);

    res.status(200).json({
      success: true,
      data: interests
    });
  } catch (error) {
    next(error);
  }
};

const updateMyInterests = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { interestIds } = req.body; // Expecting an array of interest IDs

    const updatedInterests = await userServices.updateMyInterests(userId, interestIds);

    // Offload heavy potential match recalculations to background process
    await queueProfileRecalculation(userId);

    res.status(200).json({
      success: true,
      message: "Interests updated successfully",
      data: updatedInterests
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const requestingUserId = req.user.user_id; // To check if blocked/matched, etc.
    const { targetUserId } = req.params;

    const profile = await userServices.getUserProfile(requestingUserId, targetUserId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

const deactivateAccount = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await userServices.deactivateAccount(userId);

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully"
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await userServices.deleteAccount(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    next(error);
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
