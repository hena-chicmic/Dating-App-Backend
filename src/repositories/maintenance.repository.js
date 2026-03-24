const User = require('../models/user.model');

class MaintenanceRepository {
    async cleanupExpiredRefreshTokens() {
        const result = await User.updateMany(
            {},
            { $pull: { refresh_tokens: { expires_at: { $lt: new Date() } } } }
        );
        return result.modifiedCount;
    }

    async cleanupExpiredEmailVerifications() {
        const result = await User.updateMany(
            { 'otp.expires_at': { $lt: new Date() } },
            { $unset: { otp: 1 } }
        );
        return result.modifiedCount;
    }

    async cleanupExpiredPasswordResets() {
        const result = await User.updateMany(
            { 'password_reset.expires_at': { $lt: new Date() } },
            { $unset: { password_reset: 1 } }
        );
        return result.modifiedCount;
    }
}

module.exports = new MaintenanceRepository();
