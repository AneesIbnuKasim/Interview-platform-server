const { AuthenticationError } = require("../util/errors");
const { verifyAccessToken } = require("../util/jwt");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return next(new AuthenticationError());
  }

  try {
    const token = authHeader.slice(7);
    req.auth = verifyAccessToken(token);
    return next();
  } catch (error) {
    return next(new AuthenticationError("Invalid or expired token"));
  }
};

module.exports = authenticate;
