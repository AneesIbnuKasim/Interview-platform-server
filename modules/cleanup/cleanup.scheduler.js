const cron = require("node-cron");
const env = require("../../config/env");
const logger = require("../../util/logger");
const cleanupService = require("./cleanup.service");

const CLEANUP_CRON = "* * * * *";

const startCleanupScheduler = () => {
  if (env.nodeEnv === "test") {
    logger.info("Cleanup scheduler disabled in test environment");
    return null;
  }

  const task = cron.schedule(
    CLEANUP_CRON,
    async () => {
      try {
        await cleanupService.runCleanup();
      } catch (error) {
        logger.error("Cleanup job failed", { message: error.message });
      }
    },
    {
      scheduled: true,
    },
  );

  logger.info("Cleanup scheduler started", { cron: CLEANUP_CRON });
  return task;
};

module.exports = {
  CLEANUP_CRON,
  startCleanupScheduler,
};
