const Joi = require('joi');

const notificationIdParamSchema = Joi.object({
    notification_id: Joi.string()
        .hex()
        .length(24)
        .required()
});

module.exports = {
    notificationIdParamSchema
};
