const db = require('../config/db');


const createReportAndBlock = async (reporterId, reportedUserId, reason, description) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const reportQuery = `
            INSERT INTO reports (reporter_id, reported_user_id, reason, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const reportResult = await client.query(reportQuery, [reporterId, reportedUserId, reason, description]);
        const report = reportResult.rows[0];

        const blockQuery = `
            INSERT INTO blocks (blocker_id, blocked_id)
            VALUES ($1, $2)
            ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
        `;
        await client.query(blockQuery, [reporterId, reportedUserId]);

        const matchQuery = `
            UPDATE matches 
            SET is_active = FALSE 
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);
        `;
        await client.query(matchQuery, [reporterId, reportedUserId]);

        await client.query('COMMIT');
        return report;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


const getReportById = async (reportId) => {
    const query = `
        SELECT r.*, 
               u1.username AS reporter_name, 
               u2.username AS reported_user_name
        FROM reports r
        JOIN users u1 ON r.reporter_id = u1.id
        JOIN users u2 ON r.reported_user_id = u2.id
        WHERE r.id = $1;
    `;
    const result = await db.query(query, [reportId]);
    return result.rows[0];
};


const getReportsByReporter = async (reporterId) => {
    const query = `
        SELECT r.*, u.username AS reported_user_name
        FROM reports r
        JOIN users u ON r.reported_user_id = u.id
        WHERE r.reporter_id = $1
        ORDER BY r.created_at DESC;
    `;
    const result = await db.query(query, [reporterId]);
    return result.rows;
};

module.exports = {
    createReportAndBlock,
    getReportById,
    getReportsByReporter
};