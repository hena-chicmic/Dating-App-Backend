const Block = require('../models/block.model');
const Match = require('../models/match.model');
const { mongoose } = require('../config/db');

class BlockRepository {
    async blockUser(blockerId, blockedId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await Block.findOneAndUpdate(
                { blocker_id: blockerId, blocked_id: blockedId },
                { blocker_id: blockerId, blocked_id: blockedId },
                { upsert: true, session }
            );

            // Deactivate any matching matches
            await Match.updateMany(
                {
                    $or: [
                        { user1_id: blockerId, user2_id: blockedId },
                        { user1_id: blockedId, user2_id: blockerId }
                    ]
                },
                { is_active: false },
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
        const result = await Block.deleteOne({ blocker_id: blockerId, blocked_id: blockedId });
        return result.deletedCount > 0;
    }

    async isBlocked(user1Id, user2Id) {
        return await Block.exists({
            $or: [
                { blocker_id: user1Id, blocked_id: user2Id },
                { blocker_id: user2Id, blocked_id: user1Id }
            ]
        });
    }
}

module.exports = new BlockRepository();
