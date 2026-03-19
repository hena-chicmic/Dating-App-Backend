const authServices = require('../services/auth.service')

const register = async (req, res, next) => {
    try {
        const { email, password, username, date_of_birth } = req.body;

        if (!email || !password || !username || !date_of_birth) {
            return res.status(400).json({ message: "Email, password, username, and date_of_birth are required" });
        }

        const { accessToken, refreshToken, user } = await authServices.register({ email, password, username, date_of_birth });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false
        })

        res.status(201).json({
            message: "user registered successfully.Please verify",
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body
        await authServices.verifyEmail(email, otp)
        res.status(200).json({
            message: "Email verified successfully"
        })

    } catch (error) {
        next(error)
    }
}

const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body
        await authServices.resendVerification(email)
        res.status(200).json({
            message: "OTP sent again"
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const { accessToken, refreshToken, user } = await authServices.login(req.body)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false
        })

        res.status(200).json({
            message: "Login successful",
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        await authServices.forgotPassword(email)
        res.status(200).json({
            message: "reset instructions sent to email"
        })

    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword, otp } = req.body;
        await authServices.resetPassword(email, newPassword, otp)
        res.status(200).json({
            message: "Password reset successfully"
        })
    } catch (error) {
        next(error)
    }
}

const refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        const accessToken = await authServices.refresh(token)
        res.json({
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        await authServices.logout(token)
        res.clearCookie("refreshToken")
        res.json({
            message: "logout successful"
        })
    } catch (error) {
        next(error)
    }
}

const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Google idToken is required" });
        }

        const { accessToken, refreshToken, user } = await authServices.googleLogin(idToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false
        });

        res.status(200).json({
            message: "Google login successful",
            accessToken
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, resendVerification, verifyEmail, login, forgotPassword, resetPassword, refresh, logout, googleLogin }
