const db = require('../config/db');

class MaintenanceRepository {
    async cleanupExpiredRefreshTokens() {
        const query = `DELETE FROM refresh_tokens WHERE expires_at < NOW()`;
        const result = await db.query(query);
        return result.rowCount;
    }

    async cleanupExpiredEmailVerifications() {
        const query = `DELETE FROM email_verifications WHERE expires_at < NOW()`;
        const result = await db.query(query);
        return result.rowCount;
    }

    async cleanupExpiredPasswordResets() {
        const query = `DELETE FROM password_resets WHERE expires_at < NOW()`;
        const result = await db.query(query);
        return result.rowCount;
    }
}

module.exports = new MaintenanceRepository();
