const { createAdapter } = require("@socket.io/redis-adapter");
const { getRedisClient } = require("./redis");

let io;

const initSocket = (server) => {
  const pubClient = getRedisClient();
  const subClient = pubClient.duplicate();

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE"]
    },
    adapter: createAdapter(pubClient, subClient)
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      socket.userId = decoded.id; // Attach userId to socket
      next();
    } catch (err) {
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