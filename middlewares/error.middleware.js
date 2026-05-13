const env = require("../config/env");
const { AppError, NotFoundError } = require("../util/errors");
const logger = require("../util/logger");

const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

const normalizeError = error => {
  if (error instanceof AppError) return error;

  if (error.name === "ValidationError") {
    return new AppError(error.message, 400, "VALIDATION_ERROR");
  }

  if (error.name === "MulterError") {
    return new AppError(error.message, 400, "UPLOAD_ERROR", {
      field: error.field,
      code: error.code,
    });
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return new AppError("Invalid or expired token", 401, "AUTHENTICATION_ERROR");
  }

  return new AppError(error.message || "Internal server error");
};

const errorHandler = (error, req, res, next) => {
  const normalized = normalizeError(error);

  logger.error(normalized.message, {
    requestId: req.id,
    code: normalized.code,
    statusCode: normalized.statusCode,
    stack: env.nodeEnv === "development" ? normalized.stack : undefined,
  });

  const body = {
    success: false,
    error: {
      message: normalized.message,
      code: normalized.code,
      details: normalized.details,
    },
  };

  if (env.nodeEnv === "development") {
    body.error.stack = normalized.stack;
  }

  return res.status(normalized.statusCode).json(body);
};

module.exports = {
  notFound,
  errorHandler,
};
