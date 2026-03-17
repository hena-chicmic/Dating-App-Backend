const Joi = require('joi');

const matchIdParamSchema = Joi.object({
    matchId: Joi.number().integer().required()
});

const messageIdParamSchema = Joi.object({
    messageId: Joi.number().integer().required()
});

const getChatQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
});

module.exports = {
    matchIdParamSchema,
    messageIdParamSchema,
    getChatQuerySchema
};
