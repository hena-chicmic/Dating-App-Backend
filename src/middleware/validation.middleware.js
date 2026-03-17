const Joi = require('joi');

/**
 * Middleware for validating requests using Joi schemas.
 * 
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @param {string} [source='body'] - The request property to validate ('body', 'query', or 'params')
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,     // Return all errors, not just the first one
            allowUnknown: true,    // Allow unknown keys (optional, but good for flexibility)
            stripUnknown: true     // Remove unknown keys from the validated object
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errorMessages
            });
        }

        // Replace req data with validated data (applies default values, type coercions)
        req[source] = value;
        next();
    };
};

module.exports = validate;
