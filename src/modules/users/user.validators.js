const Joi = require("joi");

const updateProfile = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  timezone: Joi.string().trim().max(80),
  roleLabel: Joi.string().trim().max(80),
});

const updatePreferences = Joi.object({
  emailNotifications: Joi.boolean(),
  autoRecordSessions: Joi.boolean(),
  defaultEditorTheme: Joi.string().valid("light", "dark", "system"),
});

module.exports = {
  updateProfile,
  updatePreferences,
};
