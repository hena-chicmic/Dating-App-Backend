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

// Ensure user1 < user2 or sort it at insertion to guarantee unique match pairs
matchSchema.index({ user1_id: 1, user2_id: 1 }, { unique: true });
matchSchema.index({ user1_id: 1, status: 1 });
matchSchema.index({ user2_id: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
