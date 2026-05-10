const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const env = require("../config/env");
const corsOptions = require("../config/cors");

const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const setupSecurity = app => {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(apiLimiter);
};

module.exports = setupSecurity;
