const Match = require('../models/match.model');
const Interaction = require('../models/interaction.model');
const Block = require('../models/block.model');

class MatchRepository {

    async checkMutualLike(userA, userB) {
        const result = await Interaction.findOne({
            user_id: userB,
            target_user_id: userA,
            action: 'like'
        });
        return !!result;
    }

    async createMatch(userA, userB) {
        // Ensure smaller ID is always user1 to guarantee unique pairs
        const strA = userA.toString();
        const strB = userB.toString();
        const user1 = strA < strB ? userA : userB;
        const user2 = strA < strB ? userB : userA;

        return await Match.findOneAndUpdate(
            { user1_id: user1, user2_id: user2 },
            {},
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    async findExistingMatch(userA, userB) {
        const strA = userA.toString();
        const strB = userB.toString();
        const user1 = strA < strB ? userA : userB;
        const user2 = strA < strB ? userB : userA;

        return await Match.findOne({
            user1_id: user1,
            user2_id: user2,
            status: 'active'
        });
    }

    async fetchUserMatches(userId) {
        const blocks = await Block.find({
            $or: [{ blocker_id: userId }, { blocked_id: userId }]
        });
        const blockedIds = blocks.map(b => 
            b.blocker_id.toString() === userId.toString() ? b.blocked_id : b.blocker_id
        );

        const matches = await Match.find({
            $or: [{ user1_id: userId }, { user2_id: userId }],
            status: 'active'
        })
        .populate({
            path: 'user1_id',
            match: { is_banned: false, _id: { $nin: blockedIds } },
            select: 'username profile.profile_photo_url profile.location_city'
        })
        .populate({
            path: 'user2_id',
            match: { is_banned: false, _id: { $nin: blockedIds } },
            select: 'username profile.profile_photo_url profile.location_city'
        })
        .sort({ created_at: -1 })
        .lean();

        const formattedMatches = [];

        for (const match of matches) {
            // Identify the partner
            const isUser1 = match.user1_id && match.user1_id._id.toString() === userId.toString();
            const partner = isUser1 ? match.user2_id : match.user1_id;

            // If partner was filtered out by match conditions (banned/blocked), skip this match
            if (!partner) continue;

            formattedMatches.push({
                match_id: match._id,
                matched_on: match.created_at,
                user_id: partner._id,
                username: partner.username,
                profile_photo_url: partner.profile?.profile_photo_url,
                location_city: partner.profile?.location_city
            });
        }

        return formattedMatches;
    }

    async isUserInMatch(userId, matchId) {
        const match = await Match.findOne({
            _id: matchId,
            $or: [{ user1_id: userId }, { user2_id: userId }],
            status: 'active'
        });
        return !!match;
    }

    async getPartner(matchId, userId) {
        const match = await Match.findById(matchId)
            .populate('user1_id', 'username profile.profile_photo_url')
            .populate('user2_id', 'username profile.profile_photo_url')
            .lean();

        if (!match) return null;

        const isUser1 = match.user1_id && match.user1_id._id.toString() === userId.toString();
        const partner = isUser1 ? match.user2_id : match.user1_id;

        if (!partner) return null;

        return {
            id: partner._id,
            username: partner.username,
            profile_photo_url: partner.profile?.profile_photo_url
        };
    }
}

module.exports = new MatchRepository();
