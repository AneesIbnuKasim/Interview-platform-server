const http = require("http");
const createApp = require("./app");
const env = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const initializeSockets = require("./sockets");
const { startCleanupScheduler } = require("./modules/cleanup/cleanup.scheduler");
const logger = require("./utils/logger");

const app = createApp();
const httpServer = http.createServer(app);

let io = null;
let cleanupScheduler = null;

const start = async () => {
  await connectDatabase();
  io = initializeSockets(httpServer);
  cleanupScheduler = startCleanupScheduler();

  httpServer.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`, {
      nodeEnv: env.nodeEnv,
      sockets: Boolean(io),
    });
  });

  return httpServer;
};

const stop = async () => {
  if (cleanupScheduler) {
    cleanupScheduler.stop();
    cleanupScheduler = null;
  }

  if (io) {
    io.close();
  }

  await new Promise(resolve => {
    httpServer.close(resolve);
  });

  await disconnectDatabase();
};

const gracefulShutdown = signal => {
  logger.info(`${signal} received, shutting down`);

  stop()
    .then(() => process.exit(0))
    .catch(error => {
      logger.error("Graceful shutdown failed", { message: error.message });
      process.exit(1);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

if (require.main === module) {
  start().catch(error => {
    logger.error("Server startup failed", { message: error.message });
    process.exit(1);
  });
}

module.exports = {
  app,
  httpServer,
  start,
  stop,
};
