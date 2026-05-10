const registerRoomHandlers = socket => {
  socket.on("room:ping", callback => {
    if (typeof callback === "function") {
      callback({ ok: true });
    }
  });
};

module.exports = registerRoomHandlers;
