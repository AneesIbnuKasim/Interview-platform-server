const Joi = require("joi");

const invitationId = Joi.string().trim().hex().length(24).required();

const createInvitation = Joi.object({
  email: Joi.string().trim().lowercase().email().max(160).required(),
  name: Joi.string().trim().max(100).allow(""),
});

const invitationParams = Joi.object({
  invitationId,
});

const listInvitations = Joi.object({
  limit: Joi.number().integer().min(1).max(100),
});

module.exports = {
  createInvitation,
  invitationParams,
  listInvitations,
};
