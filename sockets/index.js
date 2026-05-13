const socketOptions = require("../config/socket");
const logger = require("../util/logger");
const socketAuth = require("./auth.socket");
const registerRoomHandlers = require("./room.socket");
const registerEditorHandlers = require("./editor.socket");
const registerChatHandlers = require("./chat.socket");
const registerMediaHandlers = require("./media.socket");
const registerSignalingHandlers = require("./signaling.socket");

const loadSocketServer = () => {
  try {
    return require("socket.io").Server;
  } catch (error) {
    logger.warn("Socket.IO package is not installed; realtime server disabled");
    return null;
  }
};

const initializeSockets = (httpServer) => {
  const SocketServer = loadSocketServer();
  if (!SocketServer) return null;

  const io = new SocketServer(httpServer, socketOptions);

  io.use(socketAuth);

  io.on("connection", (socket) => {
    logger.info("Socket connected", {
      socketId: socket.id,
      userId: socket.auth?.id,
    });

    registerRoomHandlers(socket, io);
    registerEditorHandlers(socket, io);
    registerChatHandlers(socket, io);
    registerMediaHandlers(socket, io);
    registerSignalingHandlers(socket, io);

    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", {
        socketId: socket.id,
        roomId: socket.data.roomId,
        reason,
      });
    });
  });

  logger.info("Socket.IO initialized");
  return io;
};

module.exports = initializeSockets;
