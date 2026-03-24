const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    match_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content_type: {
        type: String,
        enum: ['text', 'image', 'audio', 'video'],
        default: 'text'
    },
    content_text: {
        type: String
    },
    media_url: {
        type: String
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

messageSchema.index({ match_id: 1, created_at: -1 }); // For chat history pagination

module.exports = mongoose.model('Message', messageSchema);
