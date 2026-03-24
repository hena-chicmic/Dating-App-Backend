const mongoose = require('mongoose');
const User = require('../models/user.model');
const Interaction = require('../models/interaction.model');
const Block = require('../models/block.model');
const { DISCOVERY } = require('../utils/constants');

class DiscoveryRepository {
    async findRecommendations(userId, limit = DISCOVERY.DEFAULT_PAGE_SIZE, offset = 0) {
        const user = await User.findById(userId).lean();
        if (!user) throw new Error("User preferences not found");

        const prefs = user.preferences || {};
        const profile = user.profile || {};
        
        // 1. Get list of users the current user already interacted with
        const interactions = await Interaction.find({ user_id: userId }).select('target_user_id').lean();
        const interactedIds = interactions.map(i => i.target_user_id);

        // 2. Get blocked users
        const blocks = await Block.find({
            $or: [{ blocker_id: userId }, { blocked_id: userId }]
        }).lean();
        const blockedIds = blocks.map(b => 
            b.blocker_id.toString() === userId.toString() ? b.blocked_id : b.blocker_id
        );

        // Compile exclusion list
        const excludeIds = [...interactedIds, ...blockedIds, userId].map(id => 
            new mongoose.Types.ObjectId(id)
        );

        // Prepare match query
        const matchQuery = {
            _id: { $nin: excludeIds },
            is_active: true,
            is_banned: false,
            'profile.profile_photo_url': { $exists: true, $ne: null },
            'bio': { $exists: true, $ne: '' }
        };

        // Gender filter — use the top-level interested_in field, not preferences
        if (user.interested_in && user.interested_in !== 'both') {
            matchQuery.gender = user.interested_in;
        }

        // Age filter
        if (prefs.min_preferred_age && prefs.max_preferred_age) {
            const today = new Date();
            const minDate = new Date(today.getFullYear() - prefs.max_preferred_age - DISCOVERY.AGE_FUDGE_FACTOR, today.getMonth(), today.getDate());
            const maxDate = new Date(today.getFullYear() - prefs.min_preferred_age + DISCOVERY.AGE_FUDGE_FACTOR, today.getMonth(), today.getDate());
            matchQuery.date_of_birth = { $gte: minDate, $lte: maxDate };
        }

        const pipeline = [];

        // Geospatial search if user has valid coordinates
        const hasCoords = profile.location && profile.location.coordinates && profile.location.coordinates.length === 2;
        if (hasCoords) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: profile.location.coordinates // [longitude, latitude]
                    },
                    distanceField: 'distance_km',
                    maxDistance: (prefs.max_distance_km || DISCOVERY.MAX_DISTANCE_KM) * 1000,
                    distanceMultiplier: 0.001,
                    spherical: true,
                    query: matchQuery // Apply the filters early inside geoNear
                }
            });
        } else {
            pipeline.push({ $match: matchQuery });
        }

        // Project fields to match the old SQL output structure closely
        pipeline.push({
            $addFields: {
                common_interests: {
                    $size: {
                        $setIntersection: [ { $ifNull: [ "$interests", [] ] }, { $ifNull: [ user.interests, [] ] } ]
                    }
                }
            }
        });

        // Add sorting (prioritize common interests, then newest users, then distance)
        const sortStage = { common_interests: -1, createdAt: -1 };
        if (hasCoords) {
            sortStage.distance_km = 1; 
        }
        
        pipeline.push({ $sort: sortStage });
        pipeline.push({ $skip: offset });
        pipeline.push({ $limit: limit });

        const results = await User.aggregate(pipeline);

        return results.map(u => ({
            id: u._id,
            username: u.username,
            age: this._calculateAge(u.date_of_birth),
            bio: u.bio,
            profile_photo_url: u.profile.profile_photo_url,
            location_city: u.profile.location_city,
            location_country: u.profile.location_country,
            common_interests: u.common_interests,
            distance_km: u.distance_km || null
        }));
    }

    _calculateAge(dob) {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        const age = new Date(diff); 
        return Math.abs(age.getUTCFullYear() - 1970);
    }
}

module.exports = new DiscoveryRepository();
