require('../config/env');

console.log('🚀 Worker Engine Booting...');

const emailWorker = require('./email.worker');
const discoveryWorker = require('./discovery.worker');
const matchWorker = require('./match.worker');
const notificationWorker = require('./notification.worker');
const maintenanceWorker = require('./maintenance.worker');

module.exports = {
    emailWorker,
    discoveryWorker,
    matchWorker,
    notificationWorker,
    maintenanceWorker
};

console.log('✅ Email Worker: Listening...');
console.log('✅ Discovery Worker: Listening...');
console.log('✅ Matches Worker: Listening...');
console.log('✅ Notifications Worker: Listening...');
console.log('✅ Maintenance Worker: Listening...');

process.stdin.resume();

process.on('SIGINT', () => {
    console.log('Worker engine shutting down gracefully...');
    process.exit(0);
});
