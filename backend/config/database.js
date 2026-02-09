const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are now default in Mongoose 6+
      // but included for clarity and backwards compatibility
    });
    
    logger.info(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
