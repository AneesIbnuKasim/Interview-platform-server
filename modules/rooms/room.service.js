const crypto = require("crypto");
const roomRepository = require("./room.repository");
const { AppError, NotFoundError } = require("../../util/errors");

const generateRoomCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

const createUniqueCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode();
    const existingRoom = await roomRepository.findByCode(code);

    if (!existingRoom) return code;
  }

  throw new AppError("Unable to create a unique room code", 500, "ROOM_CODE_GENERATION_FAILED");
};

const isParticipant = (room, userId) => {
  return room.participants.some(
    (participant) => participant.user.toString() === userId.toString(),
  );
};

const getParticipant = (room, userId) => {
  return room.participants.find(
    (participant) => participant.user.toString() === userId.toString(),
  );
};

const ensureRoomCanBeJoined = (room) => {
  if (room.status === "ended" || room.status === "archived") {
    throw new AppError("This room is no longer available", 409, "ROOM_CLOSED");
  }
};

const updateRoomStatusFromParticipants = (room) => {
  const activeCount = room.participants.filter(
    (participant) => participant.status === "active",
  ).length;

  if (activeCount > 0 && room.status === "waiting") {
    room.status = "active";
    room.startedAt = room.startedAt || new Date();
  }

  if (activeCount === 0 && room.status === "active") {
    room.status = "ended";
    room.endedAt = room.endedAt || new Date();
  }
};

const createRoom = async (payload, user) => {
  const code = payload.code ? payload.code.toUpperCase() : await createUniqueCode();
  const existingRoom = await roomRepository.findByCode(code);

  if (existingRoom) {
    throw new AppError("Room code already exists", 409, "ROOM_CODE_EXISTS");
  }

  const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;
  const isScheduled = Boolean(scheduledAt);
  const title =
    payload.title ||
    [payload.interviewType || "Interview", payload.candidateName]
      .filter(Boolean)
      .join(" · ") ||
    `Interview · ${code}`;

  const room = await roomRepository.create({
    code,
    title,
    candidateName: payload.candidateName || "",
    candidateEmail: payload.candidateEmail || "",
    interviewType: payload.interviewType || "Coding Interview",
    scheduledAt,
    owner: user._id,
    status: isScheduled ? "waiting" : "active",
    startedAt: isScheduled ? null : new Date(),
    participants: [
      {
        user: user._id,
        name: user.name,
        role: "interviewer",
        status: "active",
      },
    ],
  });

  return { room: room.toClient() };
};

const getRoom = async (roomId) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  return { room: room.toClient() };
};

const listRooms = async (userId, options) => {
  const rooms = await roomRepository.listForUser(userId, options);

  return {
    rooms: rooms.map((room) => room.toClient()),
  };
};

const joinRoom = async (roomId, payload, user) => {
  const room = await roomRepository.findByIdOrCode(roomId || payload.roomCode);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  ensureRoomCanBeJoined(room);

  const participant = getParticipant(room, user._id);

  if (participant) {
    participant.name = payload.displayName || user.name;
    participant.role = payload.role || participant.role;
    participant.status = "active";
    participant.leftAt = null;
    participant.joinedAt = participant.joinedAt || new Date();
  } else {
    room.participants.push({
      user: user._id,
      name: payload.displayName || user.name,
      role: payload.role || "interviewer",
      status: "active",
      joinedAt: new Date(),
    });
  }

  updateRoomStatusFromParticipants(room);
  await room.save();

  return { room: room.toClient() };
};

const leaveRoom = async (roomId, user) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  if (!isParticipant(room, user._id)) {
    throw new AppError("You are not a participant in this room", 409, "NOT_ROOM_PARTICIPANT");
  }

  const participant = getParticipant(room, user._id);
  participant.status = "left";
  participant.leftAt = new Date();

  updateRoomStatusFromParticipants(room);
  await room.save();

  return { room: room.toClient() };
};

const updateStatus = async (roomId, status, user) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  if (room.owner.toString() !== user._id.toString()) {
    throw new AppError("Only the room owner can update room status", 403, "ROOM_OWNER_REQUIRED");
  }

  room.status = status;

  if (status === "active") {
    room.startedAt = room.startedAt || new Date();
    room.endedAt = null;
  }

  if (status === "ended" || status === "archived") {
    room.endedAt = room.endedAt || new Date();
  }

  await room.save();

  return { room: room.toClient() };
};

module.exports = {
  createRoom,
  getRoom,
  listRooms,
  joinRoom,
  leaveRoom,
  updateStatus,
};
