const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    blocker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blocked_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Ensure a user cannot block the same person twice
blockSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true });

module.exports = mongoose.model('Block', blockSchema);
