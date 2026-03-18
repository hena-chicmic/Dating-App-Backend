const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE"]
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token.replace(/^Bearer\s+/, ''), process.env.ACCESS_SECRET);
      
      // Fortified Payload Mapping: Support all variations of JWT generation across the app
      socket.userId = decoded.user_id || decoded.id || decoded.userId; 
      
      if (!socket.userId) {
          console.warn("Socket connected but no recognizable user id found in token:", decoded);
      }
      
      next();
    } catch (err) {
      console.error("Socket authentication rejected:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id, "UserId:", socket.userId);

    require("../socket/socket.handlers")(socket, io);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };