const { emailQueue, queueVerificationEmail, queuePasswordResetEmail } = require('./email.queue');
const { discoveryQueue, queueProfileRecalculation } = require('./discovery.queue');
const { matchQueue, addMatchJob } = require('./match.queue');
const { notificationQueue, addNotificationJob } = require('./notification.queue');
const { maintenanceQueue } = require('./maintenance.queue');

module.exports = {
    emailQueue,
    queueVerificationEmail,
    queuePasswordResetEmail,
    discoveryQueue,
    queueProfileRecalculation,
    matchQueue,
    addMatchJob,
    notificationQueue,
    addNotificationJob,
    maintenanceQueue
};
