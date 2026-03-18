const crypto = require('crypto')

const authRepository = require('../repositories/auth.repository')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const { verifyToken } = require('../utils/jwt')
const { OAuth2Client } = require('google-auth-library')
const { queueVerificationEmail, queuePasswordResetEmail } = require('../queues/email.queue')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


const register = async (data) => {
    const { username, email, password, date_of_birth } = data

    const exists = await authRepository.checkUserExists(email)
    if (exists) {
        throw new Error("user already exists!!")
    }
    const hashedPassword = await hashPassword(password)

    const otp = Math.floor(100000 + Math.random() * 900000)

    const user = await authRepository.register(data, hashedPassword, otp)

    // Send the verification email using the BullMQ background worker queue
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

    // Send the verification email using the background worker queue
    await queueVerificationEmail(user.email, otp);

    return true
}

const login = async (data) => {

    const { email, password } = data

    // Note: login inside repository returns { user } or { user: null } 
    // and doesn't explicitly throw errors to match how we handle it in service
    const loginResult = await authRepository.login(email, null) // the token will be saved later

    if (!loginResult.user) {
        throw new Error("Invalid email or password")
    }

    const user = loginResult.user

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
    
    if (userOrError instanceof Error) {
        return userOrError
    }

    // Dispatch the password reset email to the background queue worker
    await queuePasswordResetEmail(email, otp);
    
    return true;
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

        const isValid = await authRepository.refresh(token)

        if (!isValid) {
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
    const { email, name } = payload

    const randomPassword = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await hashPassword(randomPassword)

    const baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : 'user'
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const uniqueUsername = `${baseUsername}${randomSuffix}`

    const dummyDob = '2000-01-01'

    const user = await authRepository.googleLogin(email, uniqueUsername, hashedPassword, dummyDob, null)

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