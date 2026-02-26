const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    logger.info("Using existing MongoDB connection");
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined in .env");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed: " + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
