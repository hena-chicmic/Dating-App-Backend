const Joi = require('joi');

const notificationIdParamSchema = Joi.object({
    notificationId: Joi.number()
        .integer()
        .positive()
        .strict()
        .required()
});

module.exports = {
    notificationIdParamSchema
};
