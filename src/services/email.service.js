const nodemailer = require('nodemailer');
const { getVerificationEmailTemplate, getPasswordResetEmailTemplate } = require('../utils/emailTemplate');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendVerificationEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Dating App" <noreply@datingapp.com>',
            to: toEmail,
            subject: 'Verify your Dating App Account',
            html: getVerificationEmailTemplate(otp)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const sendPasswordResetEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Dating App" <noreply@datingapp.com>',
            to: toEmail,
            subject: 'Password Reset Request',
            html: getPasswordResetEmailTemplate(otp)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
