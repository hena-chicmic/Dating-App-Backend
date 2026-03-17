const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username should have a minimum length of {#limit}',
        'any.required': 'Username is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least {#limit} characters long',
        'any.required': 'Password is required'
    }),
    date_of_birth: Joi.date().iso().less('now').required().messages({
        'date.format': 'Date of birth must be a valid ISO date (YYYY-MM-DD)',
        'date.less': 'Date of birth must be in the past',
        'any.required': 'Date of birth is required'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
});

const verifyEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required().messages({
        'string.length': 'OTP must be exactly {#limit} characters long'
    })
});

const requestPasswordResetSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least {#limit} characters long'
    })
});

const resendVerificationSchema = Joi.object({
    email: Joi.string().email().required()
});

const googleLoginSchema = Joi.object({
    idToken: Joi.string().required()
});

module.exports = {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    resendVerificationSchema,
    googleLoginSchema
};
