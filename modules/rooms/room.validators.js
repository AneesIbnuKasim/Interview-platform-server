const Joi = require("joi");

const roomCode = Joi.string().trim().min(3).max(32);
const roomId = Joi.string().trim().min(3).max(32).required();

const createRoom = Joi.object({
  code: roomCode,
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

const joinRoomByPath = Joi.object({
  displayName: Joi.string().trim().max(100),
  role: Joi.string().valid("interviewer", "candidate", "observer"),
});

const joinRoomParams = Joi.object({
  roomId,
});

const roomParams = Joi.object({
  roomId,
});

const updateStatus = Joi.object({
  status: Joi.string().valid("waiting", "active", "ended", "archived").required(),
});

const listRooms = Joi.object({
  limit: Joi.number().integer().min(1).max(100),
});

module.exports = {
  createRoom,
  joinRoom,
  joinRoomByPath,
  joinRoomParams,
  roomParams,
  updateStatus,
  listRooms,
};
