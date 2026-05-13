const chatService = require("../modules/chat/chat.service");
const {
  schemas,
  validateSocketPayload,
} = require("../modules/chat/chat.validator");
const EVENTS = require("./socket.events");
const roomStore = require("./room.store");

const fail = (socket, callback, error) => {
  const payload = {
    success: false,
    message: error.message || "Chat socket error",
    details: error.details || null,
  };

  if (typeof callback === "function") {
    callback(payload);
    return;
  }

  socket.emit(EVENTS.CHAT_ERROR, payload);
};

const getRoomId = (socket, payload = {}) => {
  return (
    payload.roomId ||
    socket.data.roomId ||
    roomStore.getRoomIdForSocket(socket.id)
  );
};

const getSender = (socket) => ({
  socketId: socket.id,
  userId: socket.user?._id?.toString(),
  name: socket.user?.name,
});

const emitNotifications = (io, roomId, notifications) => {
  if (!notifications.length) return;

  const participants = roomStore.getParticipants(roomId);

  notifications.forEach((notification) => {
    const recipientSockets = participants.filter((participant) => {
      return participant.userId === notification.recipientId;
    });

    recipientSockets.forEach((participant) => {
      io.to(participant.socketId).emit(EVENTS.NOTIFICATION_NEW, {
        notification,
      });
    });
  });
};

const handleHistory = async (socket, payload = {}, callback) => {
  try {
    const data = validateSocketPayload(schemas.history, {
      ...payload,
      roomId: getRoomId(socket, payload),
    });
    const result = await chatService.listMessages(
      data.roomId,
      data,
      socket.user,
    );

    socket.emit(EVENTS.CHAT_HISTORY, result);

    if (typeof callback === "function") {
      callback({ success: true, ...result });
    }
  } catch (error) {
    fail(socket, callback, error);
  }
};

const handleMessageSend = async (socket, io, payload = {}, callback) => {
  try {
    const data = validateSocketPayload(schemas.message, {
      ...payload,
      roomId: getRoomId(socket, payload),
    });
    const { room, message } = await chatService.createMessage(
      data.roomId,
      data,
      socket.user,
    );
    const roomId = room.code;
    const notifications = await chatService.createMessageNotifications(
      room,
      message,
      socket.user,
    );

    io.to(roomStore.roomChannel(roomId)).emit(EVENTS.CHAT_MESSAGE_CREATED, {
      roomId,
      message,
      from: getSender(socket),
    });

    emitNotifications(io, roomId, notifications);

    if (typeof callback === "function") {
      callback({ success: true, roomId, message });
    }
  } catch (error) {
    fail(socket, callback, error);
  }
};

const handleTyping = (socket, payload = {}, callback) => {
  try {
    const data = validateSocketPayload(schemas.typing, {
      ...payload,
      roomId: getRoomId(socket, payload),
    });

    socket.to(roomStore.roomChannel(data.roomId)).emit(EVENTS.CHAT_TYPING, {
      roomId: data.roomId,
      isTyping: data.isTyping,
      user: getSender(socket),
    });

    if (typeof callback === "function") {
      callback({ success: true });
    }
  } catch (error) {
    fail(socket, callback, error);
  }
};

const handleRead = async (socket, payload = {}, callback) => {
  try {
    const data = validateSocketPayload(schemas.read, {
      ...payload,
      roomId: getRoomId(socket, payload),
    });
    const result = await chatService.markRoomNotificationsRead(
      data.roomId,
      socket.user,
    );

    if (typeof callback === "function") {
      callback({ success: true, ...result });
    }
  } catch (error) {
    fail(socket, callback, error);
  }
};

const registerChatHandlers = (socket, io) => {
  socket.on(EVENTS.CHAT_HISTORY_REQUEST, (payload, callback) => {
    handleHistory(socket, payload, callback);
  });

  socket.on(EVENTS.CHAT_MESSAGE_SEND, (payload, callback) => {
    handleMessageSend(socket, io, payload, callback);
  });

  socket.on(EVENTS.CHAT_TYPING, (payload, callback) => {
    handleTyping(socket, payload, callback);
  });

  socket.on(EVENTS.CHAT_READ, (payload, callback) => {
    handleRead(socket, payload, callback);
  });
};

module.exports = registerChatHandlers;
