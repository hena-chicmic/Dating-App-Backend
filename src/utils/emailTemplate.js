const getVerificationEmailTemplate = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ff4b4b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Dating App!</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #333333;">Hello there,</p>
            <p style="font-size: 16px; color: #333333;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 15 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ff4b4b; background-color: #ffeaea; padding: 15px 30px; border-radius: 8px;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 14px; color: #777777;">If you did not request this verification, please ignore this email.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #999999; margin: 0;">&copy; ${new Date().getFullYear()} Dating App. All rights reserved.</p>
        </div>
    </div>
    `;
};

const getPasswordResetEmailTemplate = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ff4b4b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #333333;">Hello,</p>
            <p style="font-size: 16px; color: #333333;">We received a request to reset your password. Please use the following One-Time Password (OTP) to set a new password. This OTP is valid for a limited time.</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ff4b4b; background-color: #ffeaea; padding: 15px 30px; border-radius: 8px;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 14px; color: #777777;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #999999; margin: 0;">&copy; ${new Date().getFullYear()} Dating App. All rights reserved.</p>
        </div>
    </div>
    `;
};

module.exports = {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate
};
