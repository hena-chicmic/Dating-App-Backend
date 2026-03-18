console.log('Booting up Background Worker Engine...');

// Import all active workers
require('./email.worker');
require('./discovery.worker');

console.log('All Background Workers are running and listening to Redis!');
