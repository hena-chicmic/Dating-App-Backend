const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        // Use the connection string from env, fallback to localhost datingapp
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/datingapp';
        
        await mongoose.connect(mongoURI);
        logger.info('Connected to MongoDB successfully.');
    } catch (error) {
        logger.error(`Failed to connect to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1); 
    }
};

// Listen for connection errors after initial connection
mongoose.connection.on('error', err => {
    logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Mongoose will automatically try to reconnect.');
});

module.exports = connectDB;
