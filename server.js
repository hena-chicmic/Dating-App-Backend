require('./src/config/env');
const app = require('./src/app');
const pool = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { getRedisClient } = require('./src/config/redis');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to the database successfully.');
        client.release();

        // Initialize Redis early
        const redisClient = getRedisClient();
        try {
            if (redisClient.status === 'wait') {
                await redisClient.connect();
            }
        } catch (err) {
            console.warn('Initial Redis connection issue, it will retry in the background:', err.message);
        }

        const server = app.listen(PORT,"0.0.0.0" ,() => {
            console.log(`Server is running on port ${PORT}`);
        });

        initSocket(server);
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
