const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    target_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['like', 'dislike', 'superlike'],
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false } // Only need created_at
});

// Compound index to prevent duplicate interactions
interactionSchema.index({ user_id: 1, target_user_id: 1 }, { unique: true });
interactionSchema.index({ target_user_id: 1, action: 1 }); // For querying who liked a user

module.exports = mongoose.model('Interaction', interactionSchema);
