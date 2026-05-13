const Joi = require("joi");
const { ValidationError } = require("../../util/errors");

const roomId = Joi.string().trim().min(1).required();

const schemas = {
  history: Joi.object({
    roomId,
    before: Joi.date().optional(),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
  message: Joi.object({
    roomId,
    text: Joi.string().trim().min(1).max(4000).required(),
    clientId: Joi.string().trim().max(80).allow("").optional(),
  }),
  typing: Joi.object({
    roomId,
    isTyping: Joi.boolean().required(),
  }),
  read: Joi.object({
    roomId,
  }),
};

const formatDetails = (details) => {
  return details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));
};

const validateSocketPayload = (schema, payload = {}) => {
  const { value, error } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    throw new ValidationError(formatDetails(error.details));
  }

  return value;
};

module.exports = {
  schemas,
  validateSocketPayload,
};
