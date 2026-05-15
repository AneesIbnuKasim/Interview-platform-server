const Joi = require("joi");

const updateProfile = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email().max(160),
  preferences: Joi.object({
    emailNotifications: Joi.boolean(),
    autoRecordSessions: Joi.boolean(),
    defaultEditorTheme: Joi.string().valid("light", "dark", "system"),
  }),
}).min(1);

module.exports = {
  updateProfile,
};
