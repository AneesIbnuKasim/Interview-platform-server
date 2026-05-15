const EVENTS = require("./socket.events");
const roomStore = require("./room.store");

const getSender = (socket) => {
  const member = roomStore.getMember(socket.id);

  return {
    socketId: socket.id,
    userId: socket.user?._id?.toString(),
    name: member?.name || socket.user?.name,
    role: member?.role,
  };
};

const resolveTargetSocketId = (socket, payload = {}) => {
  const roomId = payload.roomId || socket.data.roomId;
  if (!roomId) return { error: "Join a room before sending WebRTC signals" };

  const targetSocketId = roomStore.findMemberSocketId(roomId, {
    socketId: payload.targetSocketId,
    userId: payload.targetUserId,
  });

  if (!targetSocketId) {
    return { error: "Target participant is not connected" };
  }

  return { roomId, targetSocketId };
};

const relaySignal = (socket, io, eventName, payload, signalKey, callback) => {
  const target = resolveTargetSocketId(socket, payload);

  if (target.error) {
    if (typeof callback === "function") callback({ success: false, message: target.error });
    socket.emit(EVENTS.ERROR, { success: false, message: target.error });
    return;
  }

  io.to(target.targetSocketId).emit(eventName, {
    roomId: target.roomId,
    from: getSender(socket),
    kind: payload.kind || "camera",
    [signalKey]: payload[signalKey],
  });

  if (typeof callback === "function") {
    callback({ success: true, targetSocketId: target.targetSocketId });
  }
};

const registerSignalingHandlers = (socket, io) => {
  socket.on(EVENTS.SIGNAL_OFFER, (payload = {}, callback) => {
    relaySignal(socket, io, EVENTS.SIGNAL_OFFER, payload, "offer", callback);
  });

  socket.on(EVENTS.SIGNAL_ANSWER, (payload = {}, callback) => {
    relaySignal(socket, io, EVENTS.SIGNAL_ANSWER, payload, "answer", callback);
  });

  socket.on(EVENTS.SIGNAL_ICE_CANDIDATE, (payload = {}, callback) => {
    relaySignal(socket, io, EVENTS.SIGNAL_ICE_CANDIDATE, payload, "candidate", callback);
  });
};

module.exports = registerSignalingHandlers;
