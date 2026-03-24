const Joi = require('joi');

const createReportSchema = Joi.object({
    reportedUserId: Joi.number()
        .integer()
        .positive()
        .strict()
        .required(),

    reason: Joi.string()
        .valid('spam', 'harassment', 'fake_profile', 'inappropriate_content', 'other')
        .required(),

    description: Joi.string()
        .max(1000)
        .empty('')
        .default(null)
})
.custom((value, helpers) => {
    const currentUserId = helpers?.prefs?.context?.userId;

    if (value.reportedUserId === currentUserId) {
        return helpers.message('You cannot report yourself');
    }

    return value;
});

const reportIdParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .strict()
        .required()
});

module.exports = {
    createReportSchema,
    reportIdParamSchema
};
