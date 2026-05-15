const Joi = require("joi");

const listNotifications = Joi.object({
  limit: Joi.number().integer().min(1).max(50),
  unreadOnly: Joi.boolean(),
});

const notificationParams = Joi.object({
  notificationId: Joi.string().hex().length(24).required(),
});

module.exports = {
  listNotifications,
  notificationParams,
};
