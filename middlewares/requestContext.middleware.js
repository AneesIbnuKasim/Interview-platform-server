const { randomUUID } = require("crypto");

const requestContext = (req, res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
};

module.exports = requestContext;
