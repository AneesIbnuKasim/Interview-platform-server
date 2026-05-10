const { verifyAccessToken } = require("../utils/jwt");

const readToken = socket => {
  const authToken = socket.handshake.auth?.token;
  const header = socket.handshake.headers?.authorization || "";

  if (authToken) return authToken;
  if (header.startsWith("Bearer ")) return header.slice(7);

  return null;
};

const socketAuth = (socket, next) => {
  const token = readToken(socket);

  if (!token) {
    socket.auth = null;
    return next();
  }

  try {
    socket.auth = verifyAccessToken(token);
    return next();
  } catch (error) {
    return next(new Error("Invalid socket token"));
  }
};

module.exports = socketAuth;
