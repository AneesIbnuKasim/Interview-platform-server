const Joi = require("joi");
const { supportedLanguages } = require("./editor.defaults");

const roomId = Joi.string().trim().min(3).max(32).required();
const fileId = Joi.string().trim().hex().length(24).required();
const fileName = Joi.string().trim().min(1).max(120).required();

const playgroundFilePayload = {
  language: Joi.string()
    .valid(...supportedLanguages)
    .required(),
  code: Joi.string().allow("").max(128 * 1024).required(),
  stdin: Joi.string().allow("").max(16 * 1024).default(""),
};

const roomParams = Joi.object({
  roomId,
});

const playgroundFileParams = Joi.object({
  fileId,
});

const runCode = Joi.object({
  language: Joi.string()
    .valid(...supportedLanguages)
    .required(),
  code: Joi.string().allow("").max(128 * 1024).required(),
  stdin: Joi.string().allow("").max(16 * 1024).default(""),
});

const createPlaygroundFile = Joi.object({
  name: fileName,
  ...playgroundFilePayload,
});

const updatePlaygroundFile = Joi.object({
  name: Joi.string().trim().min(1).max(120),
  language: Joi.string().valid(...supportedLanguages),
  code: Joi.string().allow("").max(128 * 1024),
  stdin: Joi.string().allow("").max(16 * 1024),
}).min(1);

module.exports = {
  createPlaygroundFile,
  playgroundFileParams,
  roomParams,
  runCode,
  updatePlaygroundFile,
};
