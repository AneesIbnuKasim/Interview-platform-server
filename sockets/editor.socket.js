const editorService = require("../modules/editor/editor.service");
const EVENTS = require("./socket.events");
const roomStore = require("./room.store");

const getRoomId = (socket, payload = {}) => {
  return (
    payload.roomId ||
    socket.data.roomId ||
    roomStore.getRoomIdForSocket(socket.id)
  );
};

const emitError = (socket, callback, message, details = null) => {
  const payload = {
    success: false,
    message,
    details,
  };

  if (typeof callback === "function") {
    callback(payload);
    return;
  }

  socket.emit(EVENTS.EDITOR_SYNC_ERROR, payload);
};

const getEditorSender = (socket) => ({
  socketId: socket.id,
  userId: socket.user?._id?.toString(),
  name: socket.user?.name,
});

const emitState = (socket, state) => {
  socket.emit(EVENTS.EDITOR_STATE, {
    state,
  });
};

const broadcastStateChange = (socket, roomId, eventName, state) => {
  socket.to(roomStore.roomChannel(roomId)).emit(eventName, {
    roomId,
    state,
    from: getEditorSender(socket),
  });
};

const handleRequestState = async (socket, payload = {}, callback) => {
  const roomId = getRoomId(socket, payload);

  if (!roomId) {
    emitError(socket, callback, "Join a room before requesting editor state");
    return;
  }

  try {
    const state = await editorService.getState(roomId);
    emitState(socket, state);
    if (typeof callback === "function") {
      callback({ success: true, state });
    }
  } catch (error) {
    emitError(socket, callback, error.message);
  }
};

const handleCodeChange = async (socket, payload = {}, callback) => {
  const roomId = getRoomId(socket, payload);

  if (!roomId) {
    emitError(socket, callback, "Join a room before syncing editor changes");
    return;
  }

  try {
    const result = await editorService.applyCodeChange(
      roomId,
      payload,
      socket.user,
    );

    if (!result.accepted) {
      if (result.reason === "STALE_VERSION") {
        emitState(socket, result.state);
      }

      if (typeof callback === "function") {
        callback({
          success: result.reason !== "STALE_VERSION",
          reason: result.reason,
          state: result.state,
        });
      }
      return;
    }

    broadcastStateChange(socket, roomId, EVENTS.EDITOR_CHANGED, result.state);

    if (typeof callback === "function") {
      callback({ success: true, state: result.state });
    }
  } catch (error) {
    emitError(socket, callback, error.message);
  }
};

const handleLanguageChange = async (socket, payload = {}, callback) => {
  const roomId = getRoomId(socket, payload);

  if (!roomId) {
    emitError(socket, callback, "Join a room before switching editor language");
    return;
  }

  try {
    const result = await editorService.changeLanguage(
      roomId,
      payload,
      socket.user,
    );

    if (!result.accepted) {
      if (result.reason === "STALE_VERSION") {
        emitState(socket, result.state);
      }

      if (typeof callback === "function") {
        callback({
          success: result.reason !== "STALE_VERSION",
          reason: result.reason,
          state: result.state,
        });
      }
      return;
    }

    broadcastStateChange(
      socket,
      roomId,
      EVENTS.EDITOR_LANGUAGE_CHANGED,
      result.state,
    );

    if (typeof callback === "function") {
      callback({ success: true, state: result.state });
    }
  } catch (error) {
    emitError(socket, callback, error.message);
  }
};

const handleSave = async (socket, payload = {}, callback) => {
  const roomId = getRoomId(socket, payload);

  if (!roomId) {
    emitError(socket, callback, "Join a room before saving editor state");
    return;
  }

  try {
    const state = await editorService.saveSession(roomId, socket.user);

    socket.to(roomStore.roomChannel(roomId)).emit(EVENTS.EDITOR_SAVED, {
      roomId,
      state,
      from: getEditorSender(socket),
    });

    if (typeof callback === "function") {
      callback({ success: true, state });
    }
  } catch (error) {
    emitError(socket, callback, error.message);
  }
};

const registerEditorHandlers = (socket) => {
  socket.on(EVENTS.EDITOR_REQUEST_STATE, (payload, callback) => {
    handleRequestState(socket, payload, callback);
  });

  socket.on(EVENTS.EDITOR_CHANGE, (payload, callback) => {
    handleCodeChange(socket, payload, callback);
  });

  socket.on(EVENTS.EDITOR_LANGUAGE_CHANGE, (payload, callback) => {
    handleLanguageChange(socket, payload, callback);
  });

  socket.on(EVENTS.EDITOR_SAVE, (payload, callback) => {
    handleSave(socket, payload, callback);
  });
};

module.exports = registerEditorHandlers;
