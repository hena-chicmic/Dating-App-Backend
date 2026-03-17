const Joi = require('joi');

const createReportSchema = Joi.object({
    reportedUserId: Joi.number().integer().required(),
    reason: Joi.string().max(255).required(),
    description: Joi.string().max(1000).optional().allow('', null)
});

const reportIdParamSchema = Joi.object({
    id: Joi.number().integer().required()
});

module.exports = {
    createReportSchema,
    reportIdParamSchema
};
