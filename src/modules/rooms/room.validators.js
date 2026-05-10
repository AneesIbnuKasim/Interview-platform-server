const Joi = require("joi");

const roomCode = Joi.string().trim().min(3).max(32);

const createRoom = Joi.object({
  title: Joi.string().trim().max(120),
  candidateName: Joi.string().trim().max(100),
  interviewType: Joi.string().trim().max(80),
  scheduledAt: Joi.date().iso(),
});

const joinRoom = Joi.object({
  roomCode: roomCode.required(),
  displayName: Joi.string().trim().max(100),
  role: Joi.string().valid("interviewer", "candidate", "observer"),
});

module.exports = {
  createRoom,
  joinRoom,
};
