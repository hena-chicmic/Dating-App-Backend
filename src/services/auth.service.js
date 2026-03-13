const crypto = require('crypto')

const db = require('../config/db')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const { verifyToken } = require('../utils/jwt')


const register = async (data) => {
    const { name, email, password } = data

    const existingUser = await db.query(
        'SELECT id from users where email=$1',
        [email]
    )
    if (existingUser.rows.length) {
        throw new Error("user already exists!!")
    }
    const hashedPassword = await hashPassword(password)

    const result = await db.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1,$2,$3)
         RETURNING id,name,email`,
        [name, email, hashedPassword]
    )

    const user = result.rows[0]

    const otp = Math.floor(100000 + Math.random() * 900000)

    await db.query(
        `INSERT INTO email_verifications (user_id, OTPtoken)
         VALUES ($1,$2)`,
        [user.id, otp]
    )

    console.log("Verification OTP:", otp)

    const accessToken = generateAccessToken({
        user_id: user.id
    })

    const refreshToken = generateRefreshToken({
        user_id: user.id,
        type: "refresh"
    })

    await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken]
    )

    return {
        user,
        accessToken,
        refreshToken
    }
}

const verifyEmail = async (userId, OTPtoken) => {


    const result = await db.query(
        `SELECT * FROM email_verifications
         WHERE user_id=$1`,
        [userId]
    )

    if (!result.rows.length) {
        throw new Error("Verification record not found")
    }

    const record = result.rows[0]


    if (record.OTPtoken != OTPtoken) {
        throw new Error("Invalid OTP")
    }


    const now = new Date()

    if (now > record.expires_at) {
        throw new Error("OTP expired")
    }


    await db.query(
        `UPDATE users
         SET is_verified = TRUE
         WHERE id = $1`,
        [userId]
    )


    await db.query(
        `DELETE FROM email_verifications
         WHERE user_id=$1`,
        [userId]
    )
    return true
}



const resendVerification = async (userId) => {


    const userResult = await db.query(
        `SELECT id, is_verified FROM users WHERE id=$1`,
        [userId]
    )

    if (!userResult.rows.length) {
        throw new Error("User not found")
    }

    const user = userResult.rows[0]


    if (user.is_verified) {
        throw new Error("Email already verified")
    }


    const otp = Math.floor(100000 + Math.random() * 900000)


    await db.query(
        `UPDATE email_verifications
         SET OTPtoken=$1,
             expires_at = NOW() + INTERVAL '15 minutes',
             created_at = NOW()
         WHERE user_id=$2`,
        [otp, userId]
    )


    console.log("New verification OTP:", otp)

    return true
}

const login = async (data) => {

    const { email, password } = data

    const result = await db.query(
        `SELECT id,name,email,password_hash,is_verified
         FROM users
         WHERE email=$1`,
        [email]
    )

    if (!result.rows.length) {
        throw new Error("Invalid email or password")
    }

    const user = result.rows[0]

    const match = await comparePassword(password, user.password_hash)

    if (!match) {
        throw new Error("Invalid email or password")
    }

    const accessToken = generateAccessToken({
        user_id: user.id
    })

    const refreshToken = generateRefreshToken({
        user_id: user.id,
        type: "refresh"
    })

    await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken]
    )

    return {
        user,
        accessToken,
        refreshToken
    }
}

const forgotPassword = async (email) => {

    const result = await db.query(
        `SELECT id FROM users WHERE email=$1`,
        [email]
    )

    if (!result.rows.length) {
        return new Error("Invalid email")
    }

    const user = result.rows[0]

    const otp = Math.floor(100000 + Math.random() * 900000)

    await db.query(
        `INSERT INTO email_verifications(user_id, otp_token)
         VALUES($1,$2)
         ON CONFLICT (user_id)
         DO UPDATE SET
            otp_token=$2,
            expires_at=NOW()+INTERVAL '15 minutes'`,
        [user.id, otp]
    )

    console.log("Reset OTP:", otp)
}



const refresh = async (token) => {
    try {

        if (!token) {
            throw new Error("Refresh token missing");
        }

        const decoded = verifyToken(token, process.env.REFRESH_SECRET);

        if (decoded.type !== "refresh") {
            throw new Error("Invalid token type");
        }

        const result = await db.query(
            "SELECT * FROM refresh_tokens WHERE token=$1 AND expires_at > NOW()",
            [token]
        );

        if (!result.rows.length) {
            throw new Error("Token not recognized or expired securely");
        }

        const accessToken = generateAccessToken({
            user_id: decoded.user_id,
        });

        return accessToken;

    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};

const resetPassword = async (newPassword, token) => {


    const result = await db.query(
        `SELECT user_id, expires_at
         FROM password_resets
         WHERE otp_token=$1`,
        [token]
    )

    if (!result.rows.length) {
        throw new Error("Invalid reset token")
    }

    const record = result.rows[0]


    if (new Date() > record.expires_at) {
        throw new Error("Reset token expired")
    }


    const hashedPassword = await hashPassword(newPassword)


    await db.query(
        `UPDATE users
         SET password_hash=$1
         WHERE id=$2`,
        [hashedPassword, record.user_id]
    )


    await db.query(
        `DELETE FROM password_resets
         WHERE user_id=$1`,
        [record.user_id]
    )

    return true
}

const logout = async (token) => {
    if (!token) return;
    
    await db.query(
        `DELETE FROM refresh_tokens
         WHERE token=$1`,
        [token]
    )
    
    return true
}

module.exports = {
    register,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    resetPassword,
    refresh,
    logout
}












