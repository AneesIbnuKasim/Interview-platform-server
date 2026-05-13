const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });
dotenv.config({ quiet: true });

const toArray = (value, fallback = []) => {
  if (!value) return fallback;
  return value.split(",").map(item => item.trim()).filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5001 ,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/pairloop",
  clientOrigins: toArray(process.env.CLIENT_ORIGINS, [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:8080",
  ]),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_USER_SECRET || "change_me_access_secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh_secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
  uploads: {
    root: process.env.UPLOAD_ROOT || path.resolve(__dirname, "../uploads"),
    publicBaseUrl: process.env.UPLOAD_PUBLIC_BASE_URL || "/uploads",
    screenshotMaxBytes: Number(process.env.SCREENSHOT_MAX_BYTES) || 5 * 1024 * 1024,
  },
};

module.exports = env;
