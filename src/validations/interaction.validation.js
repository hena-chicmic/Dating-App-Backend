const Joi = require('joi');

const swipeSchema = Joi.object({
    targetUserId: Joi.string().required().messages({
        'any.required': 'Target user ID is required'
    }),
    action: Joi.string().valid('like', 'dislike').required().messages({
        'any.only': 'Action must be either like or dislike',
        'any.required': 'Action is required'
    })
});

module.exports = {
    swipeSchema
};
