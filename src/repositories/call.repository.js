const db = require('../config/db');

class CallRepository {
    async createCallLog({ matchId, callerId, receiverId }) {
        const query = `
            INSERT INTO call_logs (match_id, caller_id, receiver_id, status)
            VALUES ($1, $2, $3, 'initiated')
            RETURNING id;
        `;
        const result = await db.query(query, [matchId, callerId, receiverId]);
        return result.rows[0].id;
    }

    async updateCallStatus(callId, { status, duration = 0, endedAt = null }) {
        const query = `
            UPDATE call_logs
            SET status = $1, 
                duration = $2, 
                ended_at = $3
            WHERE id = $4
            RETURNING *;
        `;
        const result = await db.query(query, [status, duration, endedAt, callId]);
        return result.rows[0];
    }

    async getCallHistory(matchId, limit = 50, offset = 0) {
        const query = `
            SELECT 
                cl.*,
                u.username as caller_name,
                r.username as receiver_name
            FROM call_logs cl
            JOIN users u ON cl.caller_id = u.id
            JOIN users r ON cl.receiver_id = r.id
            WHERE cl.match_id = $1
            ORDER BY cl.started_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await db.query(query, [matchId, limit, offset]);
        return result.rows;
    }
}

module.exports = new CallRepository();
