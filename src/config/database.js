const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  logger.info("MongoDB connected");
  return mongoose.connection;
};

const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
