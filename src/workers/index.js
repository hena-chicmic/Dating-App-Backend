/**
 * Worker Engine (The Microservice process)
 * 
 * To run this independently of the API: `node src/workers/index.js`
 */
require('../config/env');

console.log('🚀 Worker Engine Booting...');

// Import all background workers so they start listening to Redis
require('./email.worker');
require('./discovery.worker');
require('./match.worker');
require('./notification.worker'); // Activated!

console.log('✅ Email Worker: Listening...');
console.log('✅ Discovery Worker: Listening...');
console.log('✅ Matches Worker: Listening...');
console.log('✅ Notifications Worker: Listening...');

// Keep the process alive
process.stdin.resume();

process.on('SIGINT', () => {
    console.log('Worker engine shutting down gracefully...');
    process.exit(0);
});
