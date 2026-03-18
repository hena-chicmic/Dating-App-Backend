const { emailQueue, queueVerificationEmail, queuePasswordResetEmail } = require('./email.queue');
const { discoveryQueue, queueProfileRecalculation } = require('./discovery.queue');

module.exports = {
    emailQueue,
    queueVerificationEmail,
    queuePasswordResetEmail,
    discoveryQueue,
    queueProfileRecalculation
};
