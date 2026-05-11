const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/env");

const signAccessToken = payload => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
};

const signRefreshToken = payload => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
};

const verifyAccessToken = token => {
  return jwt.verify(token, env.jwt.accessSecret);
};

const verifyRefreshToken = token => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

const hashToken = token => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getTokenExpiry = token => {
  const decoded = jwt.decode(token);
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getTokenExpiry,
};
