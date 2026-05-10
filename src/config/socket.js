const env = require("./env");

const socketOptions = {
  cors: {
    origin: env.clientOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
};

module.exports = socketOptions;
