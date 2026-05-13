const EVENTS = require("./socket.events");
const roomStore = require("./room.store");

const emitMediaUpdate = (socket, io, member) => {
  io.to(roomStore.roomChannel(member.roomId)).emit(EVENTS.PARTICIPANT_MEDIA_CHANGED, {
    roomId: member.roomId,
    participant: member,
  });
};

const registerMediaHandlers = (socket, io) => {
  socket.on(EVENTS.MEDIA_MIC_TOGGLE, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, { micOn: Boolean(payload.micOn) });
    if (!member) {
      if (typeof callback === "function") callback({ success: false, message: "Join a room first" });
      return;
    }

    emitMediaUpdate(socket, io, member);
    if (typeof callback === "function") callback({ success: true, participant: member });
  });

  socket.on(EVENTS.MEDIA_CAMERA_TOGGLE, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, { cameraOn: Boolean(payload.cameraOn) });
    if (!member) {
      if (typeof callback === "function") callback({ success: false, message: "Join a room first" });
      return;
    }

    emitMediaUpdate(socket, io, member);
    if (typeof callback === "function") callback({ success: true, participant: member });
  });

  socket.on(EVENTS.MEDIA_SPEAKING, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, { speaking: Boolean(payload.speaking) });
    if (!member) {
      if (typeof callback === "function") callback({ success: false, message: "Join a room first" });
      return;
    }

    io.to(roomStore.roomChannel(member.roomId)).emit(EVENTS.PARTICIPANT_SPEAKING, {
      roomId: member.roomId,
      participant: member,
      speaking: member.media.speaking,
    });
    if (typeof callback === "function") callback({ success: true, participant: member });
  });
};

module.exports = registerMediaHandlers;
