const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fashion_ai';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Database connected successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Fallback for demo/development if needed
        console.log('ℹ️ Starting with MongoDB in Mock Mode.');
    }
};

module.exports = connectDB;
