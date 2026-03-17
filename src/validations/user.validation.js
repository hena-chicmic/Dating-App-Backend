const Joi = require('joi');

const updateProfileSchema = Joi.object({
    bio: Joi.string().max(500).allow('', null),

    gender: Joi.string()
        .valid('male', 'female', 'non-binary', 'other')
        .required(),

    interested_in: Joi.string()
        .valid('male', 'female', 'non-binary', 'everyone')
        .required(),

    min_preferred_age: Joi.number().integer().min(18).allow(null),
    max_preferred_age: Joi.number().integer().min(18).allow(null),

    height: Joi.number().min(50).max(300).allow(null),

    location_city: Joi.string()
        .max(100)
        .required(),

    location_country: Joi.string()
        .max(100)
        .required(),

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
