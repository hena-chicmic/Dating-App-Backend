const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password_hash: {
        type: String,
        required: true
    },
    date_of_birth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others']
    },
    interested_in: {
        type: String,
        enum: ['male', 'female', 'both']
    },
    bio: {
        type: String,
        default: ''
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_banned: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    
    // Embedded Profile Data
    profile: {
        height: Number,
        location_city: String,
        location_country: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere'
            }
        },
        profile_photo_url: String,
        media: [{
            media_url: String,
            media_type: { type: String, default: 'image' },
            is_primary: { type: Boolean, default: false },
            created_at: { type: Date, default: Date.now }
        }],
        created_at: { type: Date, default: Date.now }
    },

    // Embedded Preferences
    preferences: {
        discovery_enabled: {
            type: Boolean,
            default: true
        },
        min_preferred_age: {
            type: Number,
            default: 18
        },
        max_preferred_age: {
            type: Number,
            default: 100
        },
        max_distance_km: {
            type: Number,
            default: 50
        }
    },

    // Aggregated interests
    interests: [String],

    // Refresh Token Management
    refresh_tokens: [{
        token: String,
        expires_at: Date
    }],

    otp: {
        code: Number,
        expires_at: Date
    },
    
    password_reset: {
        otp: Number,
        expires_at: Date
    }

}, {
    timestamps: true
});

// Virtual for Age calculation
userSchema.virtual('age').get(function() {
    if (!this.date_of_birth) return null;
    const diff = Date.now() - this.date_of_birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

module.exports = mongoose.model('User', userSchema);
