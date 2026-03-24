const User = require('../models/user.model');

const register = async (data, hashedPassword, otp) => {
    const { username, email, date_of_birth } = data;

    const user = new User({
        username,
        email,
        password_hash: hashedPassword,
        date_of_birth,
        otp: {
            code: otp,
            expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        }
    });

    await user.save();
    return {
        id: user._id,
        username: user.username,
        email: user.email
    };
};

const saveRefreshToken = async (userId, refreshToken) => {
    await User.findByIdAndUpdate(userId, {
        $push: {
            refresh_tokens: {
                token: refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        }
    });
};

const verifyEmail = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.otp || user.otp.code !== parseInt(otp)) {
        throw new Error("Invalid OTP or verification record not found");
    }

    if (new Date() > user.otp.expires_at) {
        throw new Error("OTP expired");
    }

    user.is_verified = true;
    user.otp = undefined; // Clear OTP
    await user.save();

    return true;
};

const resendVerification = async (email, newOtp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.is_verified) {
        throw new Error("Email already verified");
    }

    user.otp = {
        code: newOtp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000)
    };

    await user.save();
    return {
        id: user._id,
        email: user.email
    };
};

const login = async (email, refreshToken) => {
    const user = await User.findOne({ email });

    if (!user) {
        return { user: null };
    }

    if (refreshToken) {
        user.refresh_tokens.push({
            token: refreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await user.save();
    }

    return { 
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            password_hash: user.password_hash,
            is_verified: user.is_verified,
            is_banned: user.is_banned
        }
    };
};

const checkUserExists = async (email) => {
    const exists = await User.exists({ email });
    return !!exists;
};

const forgotPassword = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        return new Error("Invalid email");
    }

    user.password_reset = {
        otp: otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000) // Default 15 mins
    };

    await user.save();
    return { id: user._id };
};

const resetPassword = async (email, newHashedPassword, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const record = user.password_reset;

    if (!record || !record.otp) {
        throw new Error("No active password reset request found.");
    }

    if (new Date() > record.expires_at) {
        user.password_reset = undefined;
        await user.save();
        throw new Error("Reset OTP expired");
    }

    if (parseInt(otp) !== record.otp) {
        throw new Error("Invalid OTP.");
    }

    user.password_hash = newHashedPassword;
    user.password_reset = undefined;
    await user.save();

    return true;
};

const refresh = async (oldToken, newToken) => {
    const user = await User.findOne({
        'refresh_tokens.token': oldToken,
        'refresh_tokens.expires_at': { $gt: new Date() },
        is_banned: false,
        is_active: true
    });

    if (!user) {
        return null;
    }

    // Filter out the old token and push the new one (Rotation)
    user.refresh_tokens = user.refresh_tokens.filter(rt => rt.token !== oldToken);
    
    user.refresh_tokens.push({
        token: newToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await user.save();
    return user._id;
};

const logout = async (token) => {
    await User.updateOne(
        { 'refresh_tokens.token': token },
        { $pull: { refresh_tokens: { token: token } } }
    );
    return true;
};

const googleLogin = async (email, uniqueUsername, hashedPassword, dummyDob, profilePhotoUrl, refreshToken) => {
    let user = await User.findOne({ email });

    if (user) {
        if (user.is_banned) {
            throw new Error("Your account has been banned due to multiple violations.");
        }
    } else {
        user = new User({
            username: uniqueUsername,
            email,
            password_hash: hashedPassword,
            date_of_birth: dummyDob,
            is_verified: true
        });
    }

    if (!user.profile) user.profile = {};
    
    if (profilePhotoUrl && !user.profile.profile_photo_url) {
        user.profile.profile_photo_url = profilePhotoUrl;
    }

    if (refreshToken) {
        user.refresh_tokens.push({
            token: refreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
    }

    await user.save();
    return {
        id: user._id,
        username: user.username,
        email: user.email
    };
};

const reactivateUser = async (userId) => {
    await User.findByIdAndUpdate(userId, { is_active: true });
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
    saveRefreshToken,
    reactivateUser
};
