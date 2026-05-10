const express = require("express");
const setupSecurity = require("./middlewares/security.middleware");
const requestContext = require("./middlewares/requestContext.middleware");
const requestLogger = require("./middlewares/requestLogger.middleware");
const sanitizeRequest = require("./middlewares/sanitize.middleware");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(requestContext);
  setupSecurity(app);
  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(sanitizeRequest);

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
