const env = require("./env");

const corsOptions = {
  origin(origin, callback) {
    console.log('callback::',env.clientOrigins, origin)
    console.log('callback check::',env.clientOrigins.includes(origin))
    if (!origin || env.clientOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = corsOptions;
