const Joi = require('joi');

const matchIdParamSchema = Joi.object({
    matchId: Joi.string()
        .hex()
        .length(24)
        .required()
});

const messageIdParamSchema = Joi.object({
    messageId: Joi.string()
        .hex()
        .length(24)
        .required()
});

const getChatQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
});

module.exports = {
    matchIdParamSchema,
    messageIdParamSchema,
    getChatQuerySchema
};
