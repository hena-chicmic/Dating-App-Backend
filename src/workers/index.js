/**
 * 2. Worker Engine (The Microservice process)
 * 
 * To run this independently of the API: `node src/workers/index.js`
 */

console.log('🚀 Worker Engine Booting...');

// Import all background workers so they start listening to Redis
require('./notification.worker');
require('./match.worker');


// NOTE: Teammates will add their modules here:
// require('./email.worker');
// require('./discovery.worker');

console.log('✅ Matches Worker: Listening...');
console.log('✅ Notifications Worker: Listening...');

// Keep the process alive
process.stdin.resume();

process.on('SIGINT', () => {
    console.log('Worker engine shutting down gracefully...');
    process.exit(0);
});
