const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/datingapp';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully.');
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    mongoose
};
