const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['new_match', 'new_message', 'profile_view', 'system', 'missed_call'],
        required: true
    },
    reference_id: {
        type: mongoose.Schema.Types.ObjectId, // Could be another User ID, Match ID, etc.
        index: true
    },
    message: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
