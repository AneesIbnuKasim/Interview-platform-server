const { verifyAccessToken } = require("../util/jwt");
const User = require("../models/User");

const readToken = socket => {
  const authToken = socket.handshake.auth?.token;
  const header = socket.handshake.headers?.authorization || "";

  if (authToken) return authToken;
  if (header.startsWith("Bearer ")) return header.slice(7);

  return null;
};

const socketAuth = async (socket, next) => {
  const token = readToken(socket);

  if (!token) {
    return next(new Error("Socket authentication required"));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== "active") {
      return next(new Error("Invalid socket user"));
    }

    socket.auth = decoded;
    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Invalid socket token"));
  }
};

module.exports = socketAuth;
