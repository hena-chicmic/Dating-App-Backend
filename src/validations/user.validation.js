const Joi = require('joi');

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

const updateProfileSchema = Joi.object({
    bio: Joi.string().max(500).allow(''),

    gender: Joi.string()
        .valid('male', 'female', 'others'),

    interested_in: Joi.string()
        .valid('male', 'female', 'both'),

    min_preferred_age: Joi.number().integer().min(18).optional(),
    max_preferred_age: Joi.number().integer().min(18).optional(),

    height: Joi.number().min(50).max(300).optional(),

    location_city: Joi.string()
        .max(100),

    location_country: Joi.string()
        .max(100),

    date_of_birth: Joi.date().iso().max(eighteenYearsAgo).message('dateMax: User must be atleast 18 years old'),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null)
});

const updatePreferencesSchema = Joi.object({
    discovery_enabled: Joi.boolean(),
    preferred_gender: Joi.string().valid('male', 'female', 'both'),
    preferred_age_min: Joi.number().integer().min(18),
    preferred_age_max: Joi.number().integer().min(18),
    max_distance_km: Joi.number().integer().min(1).max(500)
}).custom((value, helpers) => {
    if (
        value.preferred_age_min != null &&
        value.preferred_age_max != null &&
        value.preferred_age_min > value.preferred_age_max
    ) {
        return helpers.message('Minimum age cannot be greater than maximum age');
    }
    return value;
})

const updateInterestsSchema = Joi.object({
    interestNames: Joi.array().items(Joi.string()).min(1).required()
});

const mediaIdParamSchema = Joi.object({
    mediaId: Joi.string().hex().length(24).required()
});

const targetUserIdParamSchema = Joi.object({
    targetUserId: Joi.string().hex().length(24).required()
});

module.exports = {
    updateProfileSchema,
    updatePreferencesSchema,
    updateInterestsSchema,
    mediaIdParamSchema,
    targetUserIdParamSchema
};
