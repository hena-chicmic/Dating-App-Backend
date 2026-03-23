const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE"]
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token.replace(/^Bearer\s+/, ''), process.env.ACCESS_SECRET);

      socket.userId = decoded.user_id || decoded.id || decoded.userId;

      if (!socket.userId) {
          logger.warn(`Socket connected but no recognizable user id found in token: ${JSON.stringify(decoded)}`);
      }

      next();
    } catch (err) {
      logger.error(`Socket authentication rejected: ${err.message}`);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id} - UserId: ${socket.userId}`);

    require("../socket/socket.handlers")(socket, io);

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };
