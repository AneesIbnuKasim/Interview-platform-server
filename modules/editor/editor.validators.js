const Joi = require("joi");
const { supportedLanguages } = require("./editor.defaults");

const roomId = Joi.string().trim().min(3).max(32).required();

const roomParams = Joi.object({
  roomId,
});

const runCode = Joi.object({
  language: Joi.string()
    .valid(...supportedLanguages)
    .required(),
  code: Joi.string().allow("").max(128 * 1024).required(),
  stdin: Joi.string().allow("").max(16 * 1024).default(""),
});

module.exports = {
  roomParams,
  runCode,
};
