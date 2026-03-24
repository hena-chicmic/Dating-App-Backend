const crypto = require('crypto')

const authRepository = require('../repositories/auth.repository')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const { verifyToken } = require('../utils/jwt')
const { OAuth2Client } = require('google-auth-library')
const { AuthenticationError, NotFoundError } = require('../utils/errors')
const { queueVerificationEmail, queuePasswordResetEmail } = require('../queues')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const register = async (data) => {
    const { username, email, password, date_of_birth } = data

    const exists = await authRepository.checkUserExists(email)
    if (exists) {
        throw new Error("A user with this email already exists.")
    }
    const usernameExists = await authRepository.checkUsernameExists(username)
    if (usernameExists) {
        throw new Error("This username is already taken.")
    }
    const hashedPassword = await hashPassword(password)

    const otp = Math.floor(100000 + Math.random() * 900000)

    const user = await authRepository.register(data, hashedPassword, otp)

    await queueVerificationEmail(user.email, otp);

    const accessToken = generateAccessToken({
        user_id: user.id
    })

    const refreshToken = generateRefreshToken({
        user_id: user.id,
        type: "refresh"
    })

    await authRepository.saveRefreshToken(user.id, refreshToken)

    return {
        user,
        accessToken,
        refreshToken
    }
}

const verifyEmail = async (email, otp) => {
    return await authRepository.verifyEmail(email, otp);
}

const resendVerification = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000)

    const user = await authRepository.resendVerification(email, otp)

    await queueVerificationEmail(user.email, otp);

    return true
}

const login = async (data) => {

    const { email, password } = data

    const loginResult = await authRepository.login(email, null)

    if (!loginResult.user) {
        throw new Error("Invalid email or password")
    }

    const user = loginResult.user

    if (user.is_banned) {
        throw new Error("Your account has been banned due to multiple violations.")
    }

    const match = await comparePassword(password, user.password_hash)

    if (!match) {
        throw new Error("Invalid email or password")
    }

    await authRepository.reactivateUser(user.id)

    const accessToken = generateAccessToken({
        user_id: user.id
    })

    const refreshToken = generateRefreshToken({
        user_id: user.id,
        type: "refresh"
    })

    await authRepository.saveRefreshToken(user.id, refreshToken)

    return {
        user,
        accessToken,
        refreshToken
    }
}

const forgotPassword = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000)

    const userOrError = await authRepository.forgotPassword(email, otp)

    await queuePasswordResetEmail(email, otp);

    return true;
}

const refresh = async (oldToken) => {
    try {
        if (!oldToken) {
            throw new AuthenticationError("Refresh token missing");
        }

        const decoded = verifyToken(oldToken, process.env.REFRESH_SECRET);

        if (decoded.type !== "refresh") {
            throw new AuthenticationError("Invalid token type");
        }

        // Generate new pair for rotation
        const newAccessToken = generateAccessToken({ user_id: decoded.user_id });
        const newRefreshToken = generateRefreshToken({ user_id: decoded.user_id, type: "refresh" });

        const userId = await authRepository.refresh(oldToken, newRefreshToken);

        if (!userId) {
            throw new AuthenticationError("Token not recognized or expired securely");
        }

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };

    } catch (error) {
        if (error instanceof AuthenticationError) throw error;
        throw new AuthenticationError("Invalid or expired refresh token");
    }
};

const resetPassword = async (email, newPassword, otp) => {
    const hashedPassword = await hashPassword(newPassword)
    return await authRepository.resetPassword(email, hashedPassword, otp)
}

const logout = async (token) => {
    if (!token) return;

    return await authRepository.logout(token)
}

const googleLogin = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { email, name, picture } = payload

    const randomPassword = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await hashPassword(randomPassword)

    const baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : 'user'
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const uniqueUsername = `${baseUsername}${randomSuffix}`

    const dummyDob = '2000-01-01'

    const user = await authRepository.googleLogin(email, uniqueUsername, hashedPassword, dummyDob, picture, null)

    if (user.is_banned) {
        throw new Error("Your account has been banned due to multiple violations.")
    }

    await authRepository.reactivateUser(user.id)

    const accessToken = generateAccessToken({ user_id: user.id })
    const refreshToken = generateRefreshToken({ user_id: user.id, type: "refresh" })

    await authRepository.saveRefreshToken(user.id, refreshToken)

    return {
        user,
        accessToken,
        refreshToken
    }
}

module.exports = {
    register,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    resetPassword,
    refresh,
    logout,
    googleLogin
}
