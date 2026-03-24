const Joi = require('joi');

const notificationIdParamSchema = Joi.object({
    notificationId: Joi.string()
        .hex()
        .length(24)
        .required()
});

module.exports = {
    notificationIdParamSchema
};
