const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    user1_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'unmatched', 'deactivated'],
        default: 'active'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure only one match entry exists for any two users
matchSchema.index({ user1_id: 1, user2_id: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
