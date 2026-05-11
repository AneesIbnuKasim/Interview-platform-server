const { AuthenticationError, AuthorizationError } = require("../util/errors");
const { verifyAccessToken } = require("../util/jwt");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return next(new AuthenticationError());
  }

  const token = authHeader.slice(7);
  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return next(new AuthenticationError("Invalid or expired token"));
  }

  const user = await User.findById(decoded.id);

  if (!user || user.status !== "active") {
    return next(new AuthenticationError("Invalid user session"));
  }

  req.auth = decoded;
  req.user = user;
  return next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError());
  }

  if (roles.length > 0 && !roles.includes(req.user.role)) {
    return next(new AuthorizationError("You do not have permission to access this resource"));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize,
};
