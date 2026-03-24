const Notification = require('../models/notification.model');

const getNotifications = async (userId) => {
    return await Notification.find({ user_id: userId })
        .select('_id type reference_id message is_read created_at')
        .sort({ created_at: -1 })
        .lean();
};

const markRead = async (userId, notificationId) => {
    return await Notification.findOneAndUpdate(
        { user_id: userId, _id: notificationId },
        { is_read: true },
        { new: true }
    );
};

const markAllRead = async (userId) => {
    const result = await Notification.updateMany(
        { user_id: userId, is_read: false },
        { $set: { is_read: true } }
    );
    return result.modifiedCount;
};

const createNotifications = async (userId, type, referenceId, message) => {
    const newNotif = new Notification({
        user_id: userId,
        type,
        reference_id: referenceId,
        message
    });
    return await newNotif.save();
};

module.exports = {
    getNotifications,
    markRead,
    markAllRead,
    createNotifications
};
