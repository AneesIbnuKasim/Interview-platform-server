const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = payload => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
};

const verifyAccessToken = token => {
  return jwt.verify(token, env.jwt.accessSecret);
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
