const db = require('../config/db');

const register = async (data, hashedPassword, otp) => {
    const { username, email, date_of_birth } = data;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert user
        const result = await client.query(
            `INSERT INTO users (username, email, password_hash, date_of_birth)
             VALUES ($1,$2,$3,$4)
             RETURNING id,username,email`,
            [username, email, hashedPassword, date_of_birth]
        );
        const user = result.rows[0];

        // 2. Insert user profile
        await client.query(
            `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
            [user.id]
        );

        // 3. Insert email verification OTP
        await client.query(
            `INSERT INTO email_verifications (user_id, OTPtoken, expires_at)
             VALUES ($1,$2, NOW() + INTERVAL '15 minutes')`,
            [user.id, otp]
        );

        await client.query('COMMIT');

        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const saveRefreshToken = async (userId, refreshToken) => {
    await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [userId, refreshToken]
    );
};

const verifyEmail = async (email, otp) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Check user exists
        const userResult = await client.query(
            `SELECT id FROM users WHERE email=$1`,
            [email]
        );

        if (!userResult.rows.length) {
            throw new Error("User not found");
        }
        const userId = userResult.rows[0].id;

        // 2. Check valid OTP
        const otpResult = await client.query(
            `SELECT * FROM email_verifications
             WHERE user_id=$1 AND OTPtoken=$2`,
            [userId, otp]
        );

        if (!otpResult.rows.length) {
            throw new Error("Invalid OTP or verification record not found");
        }

        const record = otpResult.rows[0];
        const now = new Date();
        if (now > record.expires_at) {
            throw new Error("OTP expired");
        }

        // 3. Mark as verified
        await client.query(
            `UPDATE users SET is_verified = TRUE WHERE id = $1`,
            [userId]
        );

        // 4. Delete OTP
        await client.query(
            `DELETE FROM email_verifications WHERE user_id=$1`,
            [userId]
        );

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const resendVerification = async (email, newOtp) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Look up user
        const userResult = await client.query(
            `SELECT id, email, is_verified FROM users WHERE email=$1`,
            [email]
        );

        if (!userResult.rows.length) {
            throw new Error("User not found");
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            throw new Error("Email already verified");
        }

        // Update or insert OTP
        await client.query(
            `UPDATE email_verifications
             SET OTPtoken=$1,
                 expires_at = NOW() + INTERVAL '15 minutes',
                 created_at = NOW()
             WHERE user_id=$2`,
            [newOtp, user.id]
        );

        await client.query('COMMIT');
        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const login = async (email, refreshToken) => {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');

        // Fetch user
        const result = await client.query(
            `SELECT id,username,email,password_hash,is_verified
             FROM users
             WHERE email=$1`,
            [email]
        );

        if (!result.rows.length) {
            return { user: null };
        }

        const user = result.rows[0];
        
        if (refreshToken) {
            await client.query(
                `INSERT INTO refresh_tokens (user_id, token, expires_at)
                 VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
                [user.id, refreshToken]
            );
        }

        await client.query('COMMIT');
        return { user };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const checkUserExists = async (email) => {
    const existingUser = await db.query(
        'SELECT id from users where email=$1',
        [email]
    );
    return existingUser.rows.length > 0;
};

const forgotPassword = async (email, otp) => {
    const result = await db.query(
        `SELECT id FROM users WHERE email=$1`,
        [email]
    );

    if (!result.rows.length) {
        return new Error("Invalid email");
    }

    const user = result.rows[0];

    await db.query(
        `INSERT INTO password_resets(user_id, otp_token)
         VALUES($1,$2)`,
        [user.id, otp]
    );

    return user;
};

const resetPassword = async (email, newHashedPassword, otp) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Find the user by email
        const userResult = await client.query(
            `SELECT id FROM users WHERE email=$1`,
            [email]
        );

        if (!userResult.rows.length) {
            throw new Error("User not found");
        }

        const userId = userResult.rows[0].id;

        // 2. Find OTP
        const result = await client.query(
            `SELECT user_id, expires_at
             FROM password_resets
             WHERE user_id=$1 AND otp_token=$2`,
            [userId, otp]
        );

        if (!result.rows.length) {
            throw new Error("Invalid or expired OTP");
        }

        const record = result.rows[0];

        if (new Date() > record.expires_at) {
            throw new Error("Reset OTP expired");
        }

        // 3. Update password
        await client.query(
            `UPDATE users SET password_hash=$1 WHERE id=$2`,
            [newHashedPassword, userId]
        );

        // 4. Delete OTP
        await client.query(
            `DELETE FROM password_resets WHERE user_id=$1`,
            [userId]
        );

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const refresh = async (token) => {
    const result = await db.query(
        "SELECT * FROM refresh_tokens WHERE token=$1 AND expires_at > NOW()",
        [token]
    );
    
    return result.rows.length > 0;
};

const logout = async (token) => {
    await db.query(
        `DELETE FROM refresh_tokens
         WHERE token=$1`,
        [token]
    );

    return true;
};

const googleLogin = async (email, uniqueUsername, hashedPassword, dummyDob, refreshToken) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const existingUser = await client.query(
            'SELECT id, username, email, is_verified FROM users WHERE email=$1',
            [email]
        );

        let user;

        if (existingUser.rows.length > 0) {
            user = existingUser.rows[0];
        } else {
            const result = await client.query(
                `INSERT INTO users (username, email, password_hash, date_of_birth, is_verified)
                 VALUES ($1,$2,$3,$4,$5)
                 RETURNING id, username, email`,
                [uniqueUsername, email, hashedPassword, dummyDob, true]
            );
            user = result.rows[0];
        }

        if (refreshToken) {
            await client.query(
                `INSERT INTO refresh_tokens (user_id, token, expires_at)
                 VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
                [user.id, refreshToken]
            );
        }

        await client.query('COMMIT');
        
        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    checkUserExists,
    register,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    resetPassword,
    refresh,
    logout,
    googleLogin,
    saveRefreshToken
};
