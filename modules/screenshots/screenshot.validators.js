const Joi = require("joi");

const roomParams = Joi.object({
  roomId: Joi.string().trim().min(1).required(),
});

const uploadScreenshot = Joi.object({
  title: Joi.string().trim().max(120).allow("").optional(),
});

const listScreenshots = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(30),
});

module.exports = {
  listScreenshots,
  roomParams,
  uploadScreenshot,
};
