const Joi = require('joi');

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const options = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        };

        if (req.user && req.user.user_id) {
            options.context = { userId: req.user.user_id };
        }

        const { error, value } = schema.validate(req[source], options);

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errorMessages
            });
        }

        req[source] = value;
        next();
    };
};

module.exports = validate;
