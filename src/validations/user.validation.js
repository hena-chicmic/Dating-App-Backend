const Joi = require('joi');

const updateProfileSchema = Joi.object({
    bio: Joi.string().max(500).allow('', null).messages({
        'string.max': 'Bio cannot exceed 500 characters'
    }),
    gender: Joi.string().valid('male', 'female', 'non-binary', 'other').required().messages({
        'any.only': 'Gender must be male, female, non-binary, or other'
    }),
    height: Joi.number().min(50).max(300).allow(null).messages({
        'number.min': 'Height must be at least 50 cm',
        'number.max': 'Height cannot exceed 300 cm'
    }),
    location_city: Joi.string().max(100).allow('', null),
    location_country: Joi.string().max(100).allow('', null),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null)
});

const updatePreferencesSchema = Joi.object({
    discovery_enabled: Joi.boolean(),
    preferred_gender: Joi.string().valid('male', 'female', 'non-binary', 'everyone').required(),
    preferred_age_min: Joi.number().integer().min(18).required(),
    preferred_age_max: Joi.number().integer().min(18).required(),
    max_distance_km: Joi.number().integer().min(1).max(500)
}).custom((value, helpers) => {
    // Ensure min age is not greater than max age
    if (value.preferred_age_min > value.preferred_age_max) {
        return helpers.message('Minimum age cannot be greater than maximum age');
    }
    return value;
});

module.exports = {
    updateProfileSchema,
    updatePreferencesSchema
};
