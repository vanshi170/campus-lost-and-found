const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection URI defined in environment variables.
 * Uses 127.0.0.1 to avoid IPv6 resolution delays on Windows systems.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
