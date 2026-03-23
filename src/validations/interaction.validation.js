const Joi = require('joi');

const swipeSchema = Joi.object({
    targetUserId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Target user ID is required'
        }),

    action: Joi.string()
        .valid('like', 'dislike')
        .lowercase()
        .required()
        .messages({
            'any.only': 'Action must be either like or dislike',
            'any.required': 'Action is required'
        })
})
.custom((value, helpers) => {
    const currentUserId = helpers?.prefs?.context?.userId;

    if (value.targetUserId === currentUserId) {
        return helpers.message('You cannot swipe on yourself');
    }

    return value;
});

module.exports = {
    swipeSchema
};
