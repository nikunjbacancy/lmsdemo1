const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    console.log('📡 Attempting to connect to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are now default in Mongoose 6+
      // but included for clarity and backwards compatibility
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    logger.info(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Connection error details:', error);
    throw error;
  }
};

module.exports = connectDB;
