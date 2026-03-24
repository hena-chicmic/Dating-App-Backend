const Interaction = require('../models/interaction.model');
const Block = require('../models/block.model');
const Match = require('../models/match.model');
const mongoose = require('mongoose');

class InteractionRepository {

    async saveInteraction(userId, targetUserId, action) {
        return await Interaction.findOneAndUpdate(
            { user_id: userId, target_user_id: targetUserId },
            { action: action },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    async getInteraction(userId, targetUserId) {
        return await Interaction.findOne({ user_id: userId, target_user_id: targetUserId });
    }

    async getSentLikes(userId) {
        const blocks = await Block.find({
            $or: [{ blocker_id: userId }, { blocked_id: userId }]
        });
        const blockedIds = blocks.map(b => 
            b.blocker_id.toString() === userId.toString() ? b.blocked_id : b.blocker_id
        );

        const interactions = await Interaction.find({
            user_id: userId,
            action: 'like',
            target_user_id: { $nin: blockedIds }
        })
        .populate({
            path: 'target_user_id',
            match: { is_banned: false },
            select: 'username date_of_birth profile.profile_photo_url profile.location_city'
        })
        .sort({ created_at: -1 })
        .lean();

        // Filter out any populated targets that were null (because they were banned)
        return interactions.filter(i => i.target_user_id).map(i => ({
            id: i.target_user_id._id,
            username: i.target_user_id.username,
            age: this._calculateAge(i.target_user_id.date_of_birth),
            profile_photo_url: i.target_user_id.profile?.profile_photo_url,
            location_city: i.target_user_id.profile?.location_city,
            liked_on: i.created_at
        }));
    }

    async getReceivedLikes(userId) {
        const blocks = await Block.find({
            $or: [{ blocker_id: userId }, { blocked_id: userId }]
        });
        const blockedIds = blocks.map(b => 
            b.blocker_id.toString() === userId.toString() ? b.blocked_id : b.blocker_id
        );

        const interactions = await Interaction.find({
            target_user_id: userId,
            action: 'like',
            user_id: { $nin: blockedIds }
        })
        .populate({
            path: 'user_id',
            match: { is_banned: false },
            select: 'username date_of_birth profile.profile_photo_url profile.location_city'
        })
        .sort({ created_at: -1 })
        .lean();

        return interactions.filter(i => i.user_id).map(i => ({
            id: i.user_id._id,
            username: i.user_id.username,
            age: this._calculateAge(i.user_id.date_of_birth),
            profile_photo_url: i.user_id.profile?.profile_photo_url,
            location_city: i.user_id.profile?.location_city,
            liked_on: i.created_at
        }));
    }

    async blockUser(blockerId, blockedId) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            await Block.findOneAndUpdate(
                { blocker_id: blockerId, blocked_id: blockedId },
                {},
                { upsert: true, new: true, session }
            );

            await Match.updateMany(
                {
                    $or: [
                        { user1_id: blockerId, user2_id: blockedId },
                        { user1_id: blockedId, user2_id: blockerId }
                    ]
                },
                { status: 'deactivated' },
                { session }
            );

            await session.commitTransaction();
            return true;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async unblockUser(blockerId, blockedId) {
        const result = await Block.findOneAndDelete({ blocker_id: blockerId, blocked_id: blockedId });
        return !!result;
    }

    _calculateAge(dob) {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        const age = new Date(diff); 
        return Math.abs(age.getUTCFullYear() - 1970);
    }
}

module.exports = new InteractionRepository();
