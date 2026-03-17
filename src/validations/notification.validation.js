const Joi = require('joi');

const notificationIdParamSchema = Joi.object({
    notification_id: Joi.number().integer().required()
});

module.exports = {
    notificationIdParamSchema
};
