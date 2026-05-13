const EVENTS = require("./socket.events");
const roomStore = require("./room.store");

const emitMediaUpdate = (socket, io, member) => {
  io.to(roomStore.roomChannel(member.roomId)).emit(
    EVENTS.PARTICIPANT_MEDIA_CHANGED,
    {
      roomId: member.roomId,
      participant: member,
    },
  );
};

const failJoinFirst = (callback) => {
  if (typeof callback === "function") {
    callback({ success: false, message: "Join a room first" });
  }
};

const emitScreenShareUpdate = (io, member, active) => {
  io.to(roomStore.roomChannel(member.roomId)).emit(
    EVENTS.MEDIA_SCREEN_SHARE_CHANGED,
    {
      roomId: member.roomId,
      participant: member,
      active,
    },
  );
};

const registerMediaHandlers = (socket, io) => {
  socket.on(EVENTS.MEDIA_MIC_TOGGLE, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, {
      micOn: Boolean(payload.micOn),
    });
    if (!member) {
      failJoinFirst(callback);
      return;
    }

    emitMediaUpdate(socket, io, member);
    if (typeof callback === "function") {
      callback({ success: true, participant: member });
    }
  });

  socket.on(EVENTS.MEDIA_CAMERA_TOGGLE, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, {
      cameraOn: Boolean(payload.cameraOn),
    });
    if (!member) {
      failJoinFirst(callback);
      return;
    }

    emitMediaUpdate(socket, io, member);
    if (typeof callback === "function") {
      callback({ success: true, participant: member });
    }
  });

  socket.on(EVENTS.MEDIA_SPEAKING, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, {
      speaking: Boolean(payload.speaking),
    });
    if (!member) {
      failJoinFirst(callback);
      return;
    }

    io.to(roomStore.roomChannel(member.roomId)).emit(
      EVENTS.PARTICIPANT_SPEAKING,
      {
        roomId: member.roomId,
        participant: member,
        speaking: member.media.speaking,
      },
    );
    if (typeof callback === "function") {
      callback({ success: true, participant: member });
    }
  });

  socket.on(EVENTS.MEDIA_SCREEN_SHARE_START, (payload = {}, callback) => {
    const roomId = roomStore.getRoomIdForSocket(socket.id);
    if (!roomId) {
      failJoinFirst(callback);
      return;
    }

    const stoppedMembers = roomStore.stopOtherScreenShares(roomId, socket.id);
    stoppedMembers.forEach((member) => {
      emitScreenShareUpdate(io, member, false);
    });

    const member = roomStore.updateMedia(socket.id, {
      screenSharing: true,
      screenShareLabel: payload.label || "Screen",
    });
    if (!member) {
      failJoinFirst(callback);
      return;
    }

    emitScreenShareUpdate(io, member, true);
    if (typeof callback === "function") {
      callback({ success: true, participant: member });
    }
  });

  socket.on(EVENTS.MEDIA_SCREEN_SHARE_STOP, (payload = {}, callback) => {
    const member = roomStore.updateMedia(socket.id, {
      screenSharing: false,
      screenShareLabel: null,
    });
    if (!member) {
      failJoinFirst(callback);
      return;
    }

    emitScreenShareUpdate(io, member, false);
    if (typeof callback === "function") {
      callback({ success: true, participant: member });
    }
  });
};

module.exports = registerMediaHandlers;
