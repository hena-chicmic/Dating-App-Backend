require('./src/config/env');
const app = require('./src/app');
const pool = require('./src/config/db');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to the database successfully.');
        client.release();

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        initSocket(server);
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
