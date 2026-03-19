require('../config/env');

console.log('🚀 Worker Engine Booting...');

require('./email.worker');
require('./discovery.worker');
require('./match.worker');
require('./notification.worker');

console.log('✅ Email Worker: Listening...');
console.log('✅ Discovery Worker: Listening...');
console.log('✅ Matches Worker: Listening...');
console.log('✅ Notifications Worker: Listening...');

process.stdin.resume();

process.on('SIGINT', () => {
    console.log('Worker engine shutting down gracefully...');
    process.exit(0);
});
