const roomService = require("../modules/rooms/room.service");
const editorService = require("../modules/editor/editor.service");
const logger = require("../util/logger");
const EVENTS = require("./socket.events");
const roomStore = require("./room.store");

const ok = (callback, data = {}) => {
  if (typeof callback === "function") callback({ success: true, ...data });
};

const fail = (socket, callback, error) => {
  const payload = {
    success: false,
    message: error.message || "Socket room error",
  };

  if (typeof callback === "function") {
    callback(payload);
    return;
  }

  socket.emit(EVENTS.ERROR, payload);
};

const getCurrentParticipant = (room, userId) => {
  return room.participants.find((participant) => participant.id === userId);
};

const createSocketMember = (socket, room, payload = {}) => {
  const userId = socket.user._id.toString();
  const participant = getCurrentParticipant(room, userId);

  return {
    socketId: socket.id,
    userId,
    name: participant?.name || payload.displayName || socket.user.name,
    role: participant?.role || payload.role || "interviewer",
    media: {
      micOn: payload.micOn ?? true,
      cameraOn: payload.cameraOn ?? true,
      screenSharing: false,
      speaking: false,
    },
  };
};

const broadcastParticipants = (io, roomId) => {
  io.to(roomStore.roomChannel(roomId)).emit(EVENTS.PARTICIPANTS_STATE, {
    roomId,
    participants: roomStore.getParticipants(roomId),
  });
};

const joinSocketRoom = async (socket, io, payload = {}, callback) => {
  const roomId = payload.roomId || payload.roomCode;

  if (!roomId) {
    fail(socket, callback, new Error("roomId is required"));
    return;
  }

  try {
    const { room } = await roomService.joinRoom(roomId, payload, socket.user);
    const roomCode = room.id;
    const channel = roomStore.roomChannel(roomCode);
    const memberPayload = createSocketMember(socket, room, payload);
    const { member, reconnected } = roomStore.addMember(roomCode, memberPayload);

    socket.join(channel);
    socket.data.roomId = roomCode;

    socket.emit(EVENTS.ROOM_STATE, {
      room,
      participants: roomStore.getParticipants(roomCode),
    });

    const editorState = await editorService.getState(roomCode);
    socket.emit(EVENTS.EDITOR_STATE, {
      state: editorState,
    });

    socket.to(channel).emit(
      reconnected ? EVENTS.PARTICIPANT_RECONNECTED : EVENTS.PARTICIPANT_JOINED,
      {
        roomId: roomCode,
        participant: member,
      },
    );

    broadcastParticipants(io, roomCode);
    ok(callback, { room, participant: member });
  } catch (error) {
    fail(socket, callback, error);
  }
};

const leaveSocketRoom = async (socket, io, payload = {}, callback) => {
  const roomId = payload.roomId || socket.data.roomId;

  if (!roomId) {
    fail(socket, callback, new Error("No active room connection"));
    return;
  }

  try {
    let room = null;

    if (payload.persist !== false) {
      const result = await roomService.leaveRoom(roomId, socket.user);
      room = result.room;
    }

    const removed = roomStore.removeMember(socket.id, { remember: false });
    socket.leave(roomStore.roomChannel(roomId));

    if (removed) {
      io.to(roomStore.roomChannel(roomId)).emit(EVENTS.PARTICIPANT_LEFT, {
        roomId,
        participant: removed.member,
      });
      broadcastParticipants(io, roomId);
    }

    socket.emit(EVENTS.ROOM_LEFT, { roomId, room });
    socket.data.roomId = null;
    ok(callback, { roomId, room });
  } catch (error) {
    fail(socket, callback, error);
  }
};

const handleDisconnect = (socket, io, reason) => {
  const removed = roomStore.removeMember(socket.id);
  if (!removed) return;

  const { roomId, member } = removed;

  socket.to(roomStore.roomChannel(roomId)).emit(EVENTS.PARTICIPANT_DISCONNECTED, {
    roomId,
    participant: member,
    reason,
  });
  broadcastParticipants(io, roomId);

  logger.info("Socket room member disconnected", {
    roomId,
    socketId: socket.id,
    userId: member.userId,
    reason,
  });
};

const registerRoomHandlers = (socket, io) => {
  socket.emit(EVENTS.CONNECTION_READY, {
    socketId: socket.id,
    user: socket.user?.toAuthJSON?.(),
  });

  socket.on(EVENTS.ROOM_JOIN, (payload, callback) => {
    joinSocketRoom(socket, io, payload, callback);
  });

  socket.on(EVENTS.ROOM_LEAVE, (payload, callback) => {
    leaveSocketRoom(socket, io, payload, callback);
  });

  socket.on("room:ping", (callback) => {
    ok(callback, { socketId: socket.id, roomId: socket.data.roomId || null });
  });

  socket.on("disconnect", (reason) => {
    handleDisconnect(socket, io, reason);
  });
};

module.exports = registerRoomHandlers;
