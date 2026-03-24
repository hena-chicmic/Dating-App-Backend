const Joi = require('joi');

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

const registerSchema = Joi.object({
    username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9._]+(?: [a-zA-Z0-9._]+)*$/)
    .required()
    .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, spaces, dots, and underscores',
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username should have a minimum length of {#limit}',
        'any.required': 'Username is required'
    }),
    email: Joi.string().email().lowercase().trim().required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/)
    .trim()
    .required()
    .messages({
        'string.pattern.name': 'Password must include uppercase, lowercase, number, and special character'
    }),

    date_of_birth: Joi.date()
    .iso()
    .max(eighteenYearsAgo)
    .required()
    .messages({
        'date.format': 'Date of birth must be a valid ISO date (YYYY-MM-DD)',
        'date.max': 'User must be at least 18 years old',
        'any.required': 'Date of birth is required'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().trim().required().messages({
        'any.required': 'Password is required'
    })
});

const verifyEmailSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    otp: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
        'string.pattern.base': 'OTP must be a 6-digit number'
    })
});

const requestPasswordResetSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    otp: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
        'string.pattern.base': 'OTP must be a 6-digit number'
    }),
    newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/)
    .trim()
    .required()
    .messages({
        'string.pattern.name': 'Password must include uppercase, lowercase, number, and special character'
    })
});

const resendVerificationSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
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
