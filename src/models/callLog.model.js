const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
    match_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    caller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['initiated', 'ongoing', 'completed', 'missed', 'rejected'],
        default: 'initiated'
    },
    started_at: {
        type: Date
    },
    ended_at: {
        type: Date
    },
    duration: {
        type: Number, // in seconds
        min: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

callLogSchema.index({ caller_id: 1, created_at: -1 });
callLogSchema.index({ receiver_id: 1, created_at: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
