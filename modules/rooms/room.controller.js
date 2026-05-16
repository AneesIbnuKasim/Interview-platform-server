const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const roomService = require("./room.service");

const createRoom = asyncHandler(async (req, res) => {
  const data = await roomService.createRoom(req.body, req.user);
  apiResponse.created(res, data, "Room created successfully");
});

const getRoom = asyncHandler(async (req, res) => {
  const data = await roomService.getRoom(req.params.roomId);
  apiResponse.success(res, data, "Room fetched successfully");
});

const listRooms = asyncHandler(async (req, res) => {
  const data = await roomService.listRooms(req.user._id, req.query);
  apiResponse.success(res, data, "Rooms fetched successfully");
});

const joinRoom = asyncHandler(async (req, res) => {
  const data = await roomService.joinRoom(req.params.roomId, req.body, req.user);
  const message = data.admissionRequired
    ? "Join request sent to the room host"
    : "Joined room successfully";

  apiResponse.success(res, data, message, data.admissionRequired ? 202 : 200);
});

const joinRoomByCode = asyncHandler(async (req, res) => {
  const data = await roomService.joinRoom(req.body.roomCode, req.body, req.user);
  const message = data.admissionRequired
    ? "Join request sent to the room host"
    : "Joined room successfully";

  apiResponse.success(res, data, message, data.admissionRequired ? 202 : 200);
});

const leaveRoom = asyncHandler(async (req, res) => {
  const data = await roomService.leaveRoom(req.params.roomId, req.user);
  apiResponse.success(res, data, "Left room successfully");
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await roomService.updateStatus(req.params.roomId, req.body.status, req.user);
  apiResponse.success(res, data, "Room status updated successfully");
});

const admitParticipant = asyncHandler(async (req, res) => {
  const data = await roomService.admitParticipant(
    req.params.roomId,
    req.params.participantId,
    req.user,
  );
  apiResponse.success(res, data, "Participant admitted successfully");
});

const denyParticipant = asyncHandler(async (req, res) => {
  const data = await roomService.denyParticipant(
    req.params.roomId,
    req.params.participantId,
    req.user,
  );
  apiResponse.success(res, data, "Participant request denied");
});

module.exports = {
  createRoom,
  getRoom,
  listRooms,
  joinRoom,
  joinRoomByCode,
  leaveRoom,
  updateStatus,
  admitParticipant,
  denyParticipant,
};
